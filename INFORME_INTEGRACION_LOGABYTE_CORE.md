# Informe de integración con Logabyte Core — 16 de octubre de 2026

## Contrato verificado

Se leyó `../logabyte/docs/CONTRATO-LOGABYTE-CORE.md` y se contrastó con los handlers reales de `../logabyte/src/app/api/internal/v1/tenants/`, `../logabyte/src/lib/saas/control-plane/autenticar-servicio.ts` y `responder-control-plane.ts`. El contrato v1 usa HTTPS, `Authorization: Bearer lbcore_<prefijo>.<secreto>`, un token asociado a un único producto y scopes por operación. Las respuestas usan `{ datos, error, metadatos }` y códigos 400, 401, 403, 404, 409, 429 y 503.

| Operación | Ruta Core | Scope |
| --- | --- | --- |
| Hostname | `GET /api/internal/v1/tenants/hostname?hostname=...` | `RESOLVER_TENANT` |
| ID | `GET /api/internal/v1/tenants/{tenantId}` | `RESOLVER_TENANT` |
| Lista paginada | `GET /api/internal/v1/tenants?limit=100&cursor=...` | `LISTAR_TENANTS` |
| Estado vigente | `GET /api/internal/v1/tenants/{tenantId}/estado` | `CONSULTAR_ESTADO` |
| URI secreta | `GET /api/internal/v1/tenants/{tenantId}/credenciales?referencia=...&version=...` | `OBTENER_CREDENCIALES` |

## Fases implementadas

1. `ClienteLogabyteCore` implementa el transporte privado con token global, URL HTTPS en producción, timeouts de 10 y 15 segundos, validación de sobres y datos, errores tipados y lectura sin caché HTTP. Verifica el producto en las respuestas que lo incluyen. La enumeración recorre todas las páginas y rechaza cursores inconsistentes. Los límites se ajustaron tras observar latencias de varios segundos del Core local conectado a TiDB remota.
2. `ProveedorLogabyteCore` se compone automáticamente en producción mediante `LOGABYTE_CORE_URL`, `LOGABYTE_CORE_PRODUCTO` y `LOGABYTE_CORE_SERVICE_TOKEN`. Desarrollo y pruebas conservan `ProveedorRegistroLocal`. No hay base compartida de respaldo.
3. La resolución de credenciales incluye explícitamente `tenantId`, referencia y versión, como exige Core. La URI se transforma en parámetros de MariaDB con TLS obligatorio; la URI y la contraseña no se guardan en la caché de metadatos ni se incorporan a mensajes de error.
4. Antes de usar un cliente Prisma, `conPrismaTenant` consulta el estado vigente en Core. Un tenant suspendido, desconocido o con Core indisponible no inicia la operación; si cambió `versionCache`, se descartan metadatos y cliente local. Este control cubre los accesos de Auth.js, acciones, APIs, webhooks, Mercado Pago y cron que pasan por `conPrismaTenant`.
5. `README.md`, `MULTI_TENANCY.md`, `ARCHITECTURE.md` y `.env.example` describen configuración y diagnóstico.
6. La prueba sobre TiDB detectó un defecto previo en el pool: `minimumIdle=0` impide que la versión instalada del driver MariaDB cree conexiones. Se cambió a `1` y se repitió la lectura de ambos silos con éxito.

## Verificación ejecutada

- `npm run verificar:cliente-core`: pasó con transporte HTTP simulado, dos tenants y bases distintas, paginación, credenciales diferentes, suspensión con entrada cacheada, tenant desconocido, caída de red, timeout y errores 401/403/429/503.
- `npm run verificar:registro-tenant`, `npm run verificar:registro-local`, `npm run verificar:factory-tenant`, `npm run verificar:auth-tenant`, `npm run verificar:webhook-tenant` y `npm run verificar:cron-expirar-pedidos`: pasaron.
- `npx tsc --noEmit` y `npm run lint`: pasaron.
- `npm run build`: pasó al ejecutarlo con permisos fuera del sandbox. El intento anterior dentro del sandbox había fallado con `EPERM` al escribir `.next`.
- Se crearon `lbcore_f75008c6_a_test` y `lbcore_f75008c6_b_test` en TiDB a partir del esquema de `pruebas_carrusel`. Cada base contiene solo su fila `Tenant`; los colores de esos tenants eran cero. No se copiaron usuarios, cuentas, tokens ni pagos. El origen `pruebas_carrusel` y `alegreslenceria` no recibieron escrituras. No se borraron bases ni se ejecutaron migraciones.
- `npm run verificar:core-silos-reales` pasó: peticiones HTTP reales a un servidor local que reproduce el contrato v1, resolución por hostname e ID, paginación, dos URIs distintas, consultas Prisma contra dos bases TiDB físicas, una sola fila Tenant por destino, bloqueo tras suspensión, tenant inexistente y Core 503. Se usó un servidor de contrato simulado, no el servicio Core desplegado.
- Se registró en `logabyte_core` un producto `gestion-stock`, una organización, dos tenants de prueba activos, dos dominios verificados, dos instancias verificadas con URI cifrada y una credencial de servicio con los cuatro permisos necesarios. El token existe solo en `.local/core-test-service-token`, ignorado por Git; Core almacena únicamente su hash. El alta fue transaccional y no tocó tenants ni bases productivos.
- Se compiló e inició el proyecto real `../logabyte` en localhost. `verificar:core-oficial-reales` pasó contra sus handlers v1 y ambas bases TiDB: resolución por hostname e ID, paginación en dos páginas con `limit=1`, lectura de los dos destinos, tenant desconocido, token inválido, referencia/version discordante y suspensión temporal que bloqueó la operación. El tenant de prueba volvió a `ACTIVO` en `finally`. Con Core detenido, la variante `CORE_TEST_OFFICIAL_OUTAGE=1` confirmó fallo cerrado antes de ejecutar una operación de base.

## Validación pendiente para habilitar producción

- La prueba de Core real se hizo con el servicio compilado en localhost y TiDB remota. Para despliegue todavía faltan URL HTTPS y token de servicio propios del entorno productivo, además de una prueba de humo allí. Los fixtures y el token local no deben usarse en producción.
- Las dos bases TiDB copiadas conservan el esquema antiguo de `pruebas_carrusel`, sin `_prisma_migrations`; la prueba actual cubre enrutamiento y lectura, no toda la lógica comercial ni la compatibilidad completa del schema vigente. `docker` no está instalado para `verificar:silos:reales`, y `verificar:aislamiento` exige host local descartable, por lo que no se ejecutó sobre estos destinos remotos.
- Core v1 solo entrega URI cuando el tenant está `ACTIVO`. Por contrato, los runners de migración/traslado no pueden abrir un destino `PROVISIONING` mediante esta API. Hace falta un contrato administrativo de Core o ejecución desde su worker con un destino seguro, antes de migrar o aprovisionar tenants productivos.
- Core aplica 120 solicitudes generales y 30 resoluciones de credenciales por minuto por token. La consulta de estado por operación garantiza fallo cerrado al observar suspensiones, pero debe probarse con carga representativa. Una transacción iniciada antes de la suspensión puede terminar: Core v1 no ofrece un lease distribuido que la revoque a mitad de ejecución.

## Despliegue y diagnóstico

1. Crear en Core el producto y los tenants productivos por su flujo administrativo, con dominio verificado, instancia verificada y credencial cifrada. Emitir una credencial de servicio del producto con `RESOLVER_TENANT`, `LISTAR_TENANTS`, `CONSULTAR_ESTADO` y `OBTENER_CREDENCIALES`.
2. Configurar en el despliegue de `gestion-stock` únicamente las variables globales `LOGABYTE_CORE_URL` (raíz HTTPS), `LOGABYTE_CORE_PRODUCTO=gestion-stock` y `LOGABYTE_CORE_SERVICE_TOKEN`. No configurar `DATABASE_URL` como fallback de tenants ni agregar variables por tienda. Los fixtures `_test` y el token local no pertenecen al despliegue.
3. Antes de dirigir tráfico, verificar contra Core productivo un hostname, su ID, estado y referencia/version sin imprimir la URI; realizar una consulta de lectura a un silo migrado y verificar que `SELECT DATABASE()` identifique el destino esperado. Repetir con tenant suspendido y Core inaccesible. Habilitar tráfico tras validar compatibilidad de esquema e historial de migraciones para cada silo.
4. Ante fallos, usar el código tipado (`CONFIGURACION`, `RED`, `TIMEOUT`, `CREDENCIAL_INVALIDA`, `PERMISO_INSUFICIENTE`, `LIMITE_EXCEDIDO`, `CORE_NO_DISPONIBLE` o `RESPUESTA_INVALIDA`); revisar producto, scopes, estado, dominio verificado, `versionCache`, referencia y versión en Core. Nunca registrar ni adjuntar token, URI o contraseña.

**Estado:** transporte productivo implementado y verificado de extremo a extremo contra Core real y dos silos de prueba. La habilitación productiva sigue pendiente de prueba en el entorno de despliegue, compatibilidad completa del esquema de cada tienda, capacidad bajo carga y contrato de aprovisionamiento/migración para `PROVISIONING`.
