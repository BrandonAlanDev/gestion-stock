# Gestion Stock

Plataforma SaaS de inventario y tienda online con Next.js App Router, Auth.js, Prisma y TiDB Cloud. Vercel alojará la aplicación; el runtime resuelve el tenant desde el dominio y usa una base independiente por tenant. Docker Compose aparece únicamente como herramienta opcional para una prueba local con bases descartables, no como host de la aplicación. La arquitectura y el estado de integración con Logabyte Core están documentados en [MULTI_TENANCY.md](MULTI_TENANCY.md).

## Requisitos

- Node.js 20 o superior.
- TiDB Cloud para los silos del entorno desplegado; MySQL, MariaDB o TiDB para desarrollo local.
- Una clave aleatoria de 32 bytes para cifrar el registro local.

## Instalación local

```bash
npm install
```

Copiá `.env.example` a `.env` y configurá al menos `AUTH_SECRET`, `TENANT_REGISTRY_ENCRYPTION_KEY` y las credenciales de los servicios que uses. Generá la clave del registro con:

```bash
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex') + '\\n')"
```

Guardá el resultado en `TENANT_REGISTRY_ENCRYPTION_KEY`. El registro cifrado queda en `.local/tenant-registry.enc.json`, directorio ignorado por Git.

Para desarrollo, enviá un JSON con tenants y conexiones por stdin:

```powershell
@'
{
  "version": 1,
  "tenants": [
    {
      "id": "tenant-demo",
      "nombre": "Tienda Demo",
      "slug": "demo",
      "dominio": "demo.localhost",
      "dominios": ["demo.localhost"],
      "estado": "ACTIVO",
      "referenciaBase": "mysql/demo",
      "versionCredenciales": "v1"
    }
  ],
  "conexiones": {
    "mysql/demo": {
      "host": "127.0.0.1",
      "puerto": 3306,
      "usuario": "usuario-local",
      "contrasena": "",
      "base": "gestion_demo",
      "ssl": false
    }
  }
}
'@ | npm run registro:local:cifrar
```

Usá dominios únicos y una base MySQL distinta por tenant. El comando cifra el contenido antes de guardarlo; no admite secretos como argumentos de consola. Para reemplazar un archivo existente, pasá `-- --sobrescribir` a npm.

`DATABASE_URL` queda reservado para invocar manualmente la CLI de Prisma sobre una base elegida, por ejemplo para preparar una base local descartable. El servidor web no usa esa variable como conexión alternativa.

## Esquema y ejecución

El schema compartido está en `prisma/schema.prisma`; el cliente generado está en `generated/prisma/` y no se edita manualmente. Cada base tenant debe recibir el mismo esquema y las mismas migraciones. El build no modifica bases:

```bash
npm run build
npm run dev
```

Para una base local vacía, apuntá `DATABASE_URL` a esa base y ejecutá `npx prisma db push`. Usalo solo para desarrollo descartable; las bases de producción deben recibir migraciones después de reconciliar el historial existente. Si no definís `DATABASE_URL`, la CLI usa una dirección inválida que no puede alcanzar otra base.

Para acceder a `demo.localhost`, configurá ese hostname en el entorno local o usá el mecanismo local de dominios de tu sistema. La app falla cerrada si el dominio no figura en el registro o si el tenant no está activo.

## Verificación de aislamiento

Las comprobaciones requieren bases tenant descartables ya preparadas. No uses una base con datos reales.

```powershell
$env:TENANT_SILO_TEST_MODE = "1"
$env:TENANT_SILO_TEST_IDS = "tenant-a,tenant-b"
npm run verificar:silos
```

Esto verifica que los tenants resuelven a bases diferentes y comparten tablas, columnas e índices. La suite de filtros heredados requiere además:

```powershell
$env:TENANT_ISOLATION_TEST_MODE = "1"
$env:TENANT_ISOLATION_TEST_TENANT_ID = "tenant-descartable"
$env:TENANT_ISOLATION_TEST_CONFIRM_TARGET = "tenant-descartable|127.0.0.1:3306/gestion_test"
npm run verificar:aislamiento
```

Esa suite heredada crea y elimina registros temporales en una sola base y solo comprueba filtros `tenantId`; exige un tenant activo del registro local, host loopback, base con sufijo `_test` y confirmación exacta del destino. No demuestra aislamiento físico entre silos. Para comprobarlo, usá IDs de bases igualmente descartables:

```powershell
$env:TENANT_SILO_ISOLATION_TEST_MODE = "1"
$env:TENANT_SILO_ISOLATION_TEST_IDS = "tenant-a,tenant-b"
npm run verificar:aislamiento-silos
```

La prueba inserta una fila temporal y un usuario con el mismo ID aleatorio en cada base indicada. Resuelve los tenants por Host, verifica que el adaptador Auth.js y el handler usado por la ruta de webhook despachen a su silo, y rechaza una sesión o `tenantId` de webhook cruzados. La verificación offline del webhook prueba aparte la firma HMAC. También confirma una transacción y fuerza otra a revertirse; al finalizar elimina los registros temporales que creó. Para reducir el riesgo de tocar datos persistentes, todas las conexiones deben usar `localhost`, `127.0.0.1` o `::1` y nombres de base terminados en `_test`; se rechazan destinos que no cumplan ambas condiciones antes de escribir. Las tres verificaciones bloquean `NODE_ENV=production`. `verificar:silos` también coteja `_prisma_migrations` contra las migraciones versionadas del repositorio.

## Aplicar migraciones a silos

`npm run migrar:silos` ejecuta `prisma migrate deploy` secuencialmente y no corre durante el build. Se puede seleccionar un grupo explícito o el conjunto completo del registro local/central. En ambos casos, inventariá cada base y verificá su DDL e historial antes de declarar reconciliada la baseline. `TENANT_MIGRATION_BASELINE_RECONCILED=1` es solo un acuse operativo; el runner no puede probar por sí mismo que el DDL real coincida con `_prisma_migrations`.

Para un grupo canario, `--planificar` es de solo lectura y muestra la confirmación exacta de destinos:

```powershell
$env:TENANT_MIGRATION_MODE = "1"
$env:TENANT_MIGRATION_IDS = "tenant-a,tenant-b"
$env:TENANT_MIGRATION_CONFIRM = "tenant-a,tenant-b"
$env:TENANT_MIGRATION_BASELINE_RECONCILED = "1"
npm run migrar:silos -- --planificar
$env:TENANT_MIGRATION_CONFIRM_TARGETS = "<cadena exacta de destinos, incluyendo tls=1 o tls=0>"
# Solo si el preflight previo informa migraciones con riesgo de datos, después de revisar su SQL:
$env:TENANT_MIGRATION_ACK_DESTRUCTIVE = "<nombres exactos y ordenados informados por el preflight>"
npm run migrar:silos
```

Para toda la flota, el runner obtiene y ordena los IDs desde `listarTenants()`; no requiere mantener IDs por tienda en Vercel. Primero inspeccioná el plan, pausá las altas y cambios del registro durante el lote, y confirmá la huella impresa:

```powershell
$env:TENANT_MIGRATION_MODE = "1"
$env:TENANT_MIGRATION_CONFIRM = "TODOS"
$env:TENANT_MIGRATION_BASELINE_RECONCILED = "1"
npm run migrar:silos -- --todos --planificar
$env:TENANT_MIGRATION_REGISTRY_FROZEN_ACK = "1"
$env:TENANT_MIGRATION_CONFIRM_TARGETS = "<huella sha256 del plan>"
# Solo si el preflight previo informa migraciones con riesgo de datos, después de revisar su SQL:
$env:TENANT_MIGRATION_ACK_DESTRUCTIVE = "<nombres exactos y ordenados informados por el preflight>"
npm run migrar:silos -- --todos
```

Antes del primer DDL, `--todos` preflighta todos los historiales y vuelve a comparar el conjunto de tenants; después revalida estado y destino antes de cada migración. Si el preflight encuentra migraciones pendientes con `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE FROM` o `MODIFY`, exige que revises el SQL y confirmes la lista exacta en `TENANT_MIGRATION_ACK_DESTRUCTIVE`. El detector es una guarda adicional y no reemplaza la revisión de todas las migraciones ni prueba que un backfill se haya ejecutado. El acuse de registro congelado es operativo: no existe un lease/snapshot distribuido que bloquee cambios concurrentes. Una falla a mitad del lote deja migrados los tenants anteriores y detiene los siguientes. En producción también exige `TENANT_MIGRATION_ALLOW_PRODUCTION=1`. No ejecutes el comando sobre bases existentes hasta validar el DDL y `_prisma_migrations` de cada una.

## Logabyte Core y despliegue

La interfaz `TenantRegistryProvider` y `ProveedorLogabyteCore` usan el [contrato privado v1 de Core](../logabyte/docs/CONTRATO-LOGABYTE-CORE.md). En producción, configurá `LOGABYTE_CORE_URL` (raíz HTTPS), `LOGABYTE_CORE_PRODUCTO=gestion-stock` y `LOGABYTE_CORE_SERVICE_TOKEN` (token Bearer `lbcore_...` del producto con scopes `RESOLVER_TENANT`, `LISTAR_TENANTS`, `CONSULTAR_ESTADO` y `OBTENER_CREDENCIALES`). Son variables globales del SaaS. El token debe pertenecer al producto indicado y estar activo. El runtime falla cerrado si faltan o son inválidas.

El cliente aplica 10 segundos de timeout a metadatos y estado, 15 segundos a credenciales, valida sobres y DTO, pagina de 100 en 100 y nunca registra URI ni contraseña. La app cachea solo metadatos durante 30 segundos por instancia; antes de cada operación `conPrismaTenant` consulta el estado vigente en Core y compara `versionCache`. Una suspensión, caída o error de Core impide iniciar la operación y desaloja el cliente Prisma de ese tenant. Core limita a 120 consultas generales y 30 resoluciones de credenciales por minuto y token: dimensioná el tráfico y el número de credenciales de servicio con el equipo de Core antes del despliegue.

El proveedor local cifrado solo es apropiado para desarrollo y pruebas; el archivo local no es un registro dinámico de producción. No hay fallback a ese registro ni a `DATABASE_URL` en producción. Para diagnosticar: verificá las tres variables globales sin imprimir el token; confirmá producto y scopes en Core; consultá los códigos tipados `CREDENCIAL_INVALIDA`, `PERMISO_INSUFICIENTE`, `LIMITE_EXCEDIDO`, `TIMEOUT`, `RED`, `CORE_NO_DISPONIBLE` o `RESPUESTA_INVALIDA`; comprobá estado efectivo, `versionCache`, referencia y versión en Core; y ejecutá `npm run verificar:cliente-core`, `npm run verificar:registro-tenant` y las pruebas de silos de abajo. Nunca copies la URI de credenciales a tickets o logs.

La secuencia de aprovisionamiento está en `src/lib/tenants/provisioning/`, detrás de puertos para el registro, TiDB Cloud, migraciones, configuración inicial y verificación. Las llamadas simultáneas para un tenant se agrupan dentro de una instancia del proceso; esto no coordina varias instancias. Todavía no hay un driver de infraestructura ni un worker conectado: el alta automática requiere operaciones de claim/lease/CAS de Logabyte Core y credenciales administrativas de TiDB Cloud con permisos apropiados para el plan confirmado. Las bases con errores quedan en `ERROR` para recuperación, sin borrado automático de datos.

## Scripts

- `npm run registro:local:cifrar`: cifra un registro local recibido por stdin.
- `npm run verificar:cliente-core`: verifica el transporte v1 contra respuestas simuladas de Core, incluyendo paginación, dos destinos, suspensión y caída; no reemplaza una prueba con Core desplegado.
- `npm run verificar:core-silos-reales`: con `CORE_TEST_SILOS_MODE=1` y dos copias `_test` registradas en `.local/core-test-targets.json`, ejercita HTTP local simulado y Prisma contra ambas bases remotas en modo lectura. Requiere acceso de red y no reemplaza la prueba contra Core desplegado.
- `npm run verificar:core-oficial-reales`: con `CORE_TEST_OFFICIAL_MODE=1`, Core compilado accesible en `CORE_TEST_URL` (por defecto `http://localhost:3100`) y los fixtures locales ignorados por Git, ejercita sus handlers reales y dos bases `_test`. Suspende temporalmente un tenant de prueba y lo reactiva en `finally`; requiere acceso a `logabyte_core` de prueba. Con Core detenido y `CORE_TEST_OFFICIAL_OUTAGE=1`, comprueba que ninguna operación llegue a la base.
- `npm run verificar:silos`: compara conexiones y esquema de dos o más bases tenant de prueba.
- `npm run verificar:silos:reales`: levanta dos contenedores MySQL temporales en loopback, cifra un registro efímero, aplica migraciones y ejecuta verificaciones de esquema y aislamiento; requiere Docker Compose.
- `npm run verificar:aislamiento-silos`: comprueba resolución por Host, el adaptador Auth.js y el handler de la ruta de webhook contra los silos reales, con IDs iguales, una sesión/tenant cruzado rechazado, transacciones confirmadas/revertidas y limpieza de fixtures; requiere hosts locales y bases con sufijo `_test`. El procesamiento/firma del webhook se verifica además con `npm run verificar:webhook-mp` y `npm run verificar:webhook-tenant`.
- `npm run verificar:reservas-stock`: comprueba expiración y liberación idempotente de reservas de stock por tenant; no conecta a MySQL.
- `npm run verificar:cron-expirar-pedidos`: invoca el handler HTTP del cron para comprobar secreto Bearer, selección de tenants activos, errores parciales y fallo cerrado del registro; usa dependencias aisladas, no conecta a MySQL ni configura el scheduler.
- `npm run verificar:guardas-aislamiento-silos`: comprueba offline que las guardas rechacen hosts remotos y bases fuera del sufijo `_test`.
- `npm run verificar:accion-prenda-tenant` y `npm run verificar:acciones-pago-tenant`: comprueban las acciones de producto y pago con dependencias aisladas y selección del tenant de servidor.
- `npm run verificar:oauth-tenant`: comprueba cifrado/autenticación y vigencia del state, vínculo con las cookies y el tenant de sesión, dominio, relay restringido y PKCE S256; no invoca Next ni Mercado Pago y no reemplaza una prueba HTTP de Auth.js.
- `npm run verificar:registro-tenant`: verifica dominios, estados, TTL e invalidación del proveedor; usa dependencias simuladas.
- `npm run verificar:provisionamiento`: verifica el orden, idempotencia y recuperación del orquestador mediante puertos de prueba en memoria.
- `npm run verificar:historial-migraciones`: verifica la comparación de nombres y checksums sin conexión a MySQL.
- `npm run verificar:manifiesto-migracion-tenant`: contrasta los 31 modelos y sus reglas de selección/dependencias con el schema Prisma; no copia datos.
- `npm run verificar:preflight-migraciones`: verifica las guardas, confirmación de destinos y opt-in antes de ejecutar migraciones.
- `npm run verificar:factory-tenant`: verifica el ciclo de vida concurrente de clientes con dobles en memoria; no reemplaza la prueba entre dos bases MySQL.
- `npm run verificar:auth-tenant`: verifica la asociación de sesión, usuario y tenant mediante un repositorio falso; no reemplaza una sesión Auth.js HTTP.
- `npm run verificar:jwt-auth-tenant`: firma y descifra JWT con el codec de Auth.js para comprobar que identidades iguales quedan vinculadas a cada tenant y que una cookie de otro dominio se invalida antes de consultar su silo; no reemplaza una prueba HTTP de NextAuth ni una conexión MySQL.
- `npm run verificar:adaptador-auth-tenant`: verifica que el adaptador Auth.js lea y escriba en el silo resuelto y rechace vínculos cruzados.
- `npm run verificar:webhook-tenant`: verifica el handler HTTP con dependencias falsas; no prueba la firma criptográfica real ni la persistencia MySQL.
- `npm run verificar:webhook-mp`: valida la firma HMAC con el SDK instalado y el enrutamiento a un proveedor simulado.
- `npm run verificar:webhook-pago`: verifica idempotencia, eventos fuera de orden y reversiones ante fallos con un doble transaccional; no reemplaza una prueba ACID con MySQL.
- `npm run verificar:aislamiento`: ejecuta pruebas heredadas de IDOR y filtros por `tenantId` en una base descartable.
- `npm run migrar:silos`: aplica migraciones versionadas a tenants seleccionados y confirmados.
- `npm run carruseles:limpiar-enlaces -- --todos`: normaliza enlaces en todos los tenants activos; se puede seleccionar uno definiendo `TENANT_ID`.

Para el mapa de módulos y límites de dominio, consultá [ARCHITECTURE.md](ARCHITECTURE.md). Para el historial y las decisiones de migración, consultá [MULTI_TENANCY.md](MULTI_TENANCY.md).
