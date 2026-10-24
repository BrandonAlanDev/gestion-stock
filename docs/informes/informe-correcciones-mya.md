# MYA — Informe técnico de correcciones y plan de verificación

**Repositorio:** `gestion-stock`  
**Revisión analizada:** `24db84b` (`tenants`)  
**Fecha de auditoría:** 24 de octubre de 2026  
**Alcance de esta entrega:** documentación y verificaciones locales no destructivas. No se modificó lógica, esquema, migraciones, infraestructura ni datos.

## 1. Resumen ejecutivo

El código actual incorpora correcciones en inventario y reservas, pagos manuales, vencimientos optativos, webhooks de Mercado Pago, consulta de métodos de pago, aislamiento por tenant y la página administrativa `/admin/pageConfig`. La evidencia de Git muestra que estas correcciones se distribuyeron en commits recientes, entre ellos `d96b66e`, `9fd5eb6`, `17af3ad`, `7b0890a` y `24db84b`.

Las comprobaciones locales que pudieron ejecutarse pasaron: TypeScript de la aplicación, ESLint, verificadores de Core, entrega, inventario, checkout, pagos, webhooks, transferencias, vencimientos, autenticación y OAuth. Son pruebas unitarias/verificadores con dobles en memoria; no acreditan concurrencia contra MariaDB, configuración real de MYA ni integración real con Mercado Pago.

El build **no quedó validado**. `npm run build` generó el cliente Prisma y Next.js se detuvo con `EPERM` al intentar crear `.next/types/app/api/mercadopago/webhook`. La ACL observada da a la identidad del sandbox permiso de lectura y ejecución, sin escritura, sobre `.next`. Por eso no es posible concluir a partir de esta ejecución si desapareció el error de prerenderizado de métodos de pago.

Tampoco se consultaron la configuración real de MYA, el DDL ni `_prisma_migrations`. La resolución habitual de tenants puede registrar auditoría en Core y no se identificó una ruta de acceso que garantice solo lectura. El estado de efectivo, transferencia, Mercado Pago y vencimientos del MYA real queda **sin verificar**. No se ejecutaron migraciones, cron ni pagos.

**Estado técnico:** correcciones de código verificadas parcialmente; falta validación con una base aislada compatible, una compilación en un entorno que pueda escribir `.next`, y una pasada funcional desde la interfaz.

## 2. Alcance y metodología

Se revisaron el historial y diff de Git, los modelos Prisma, los servicios/actions, componentes del checkout y administración, el handler de cron y los verificadores disponibles. El árbol de trabajo estaba limpio antes de crear este informe. No se ejecutaron scripts históricos incompatibles ni comandos que escriban en bases de datos.

Las pruebas simuladas usan clientes Prisma falsos, funciones inyectadas, datos en memoria o solicitudes `NextRequest` construidas localmente. El verificador de Core también usa proveedores/pools falsos; no se conectó a Core. La compilación de `tsconfig.scripts.json` se ejecutó solo para diagnosticar compatibilidad y no ejecuta esos scripts.

No se ejecutaron `prisma migrate status`, `migrate deploy`, `db push`, el endpoint de cron ni consultas a una base real. El baseline configurado por el proyecto está en `prisma/migrations-base-unica/`; `prisma.config.ts` toma el destino CLI de `LOGABYTE_CORE_SELECTED_DATABASE_URL` y usa un destino local deliberadamente inválido si no hay selección. Conocer y seleccionar una URL real requiere un procedimiento autorizado que garantice lectura y no genere auditorías en Core.

## 3. Correcciones implementadas

### 3.1 Edición concurrente y eliminación de variantes

**Problema original y causa.** Un formulario puede conservar una cantidad de stock antigua mientras una venta, reserva o ajuste actualiza la variante. Guardar esa cantidad como un nuevo valor absoluto puede deshacer el movimiento ocurrido entre la lectura y el guardado. La eliminación anterior de una prenda no verificaba transaccionalmente el stock ni las referencias de sus variantes antes de borrar.

**Solución actual.** `actualizarVarianteConControlStock` compara el stock persistido con el snapshot enviado (`where.stock = stockOriginal`), calcula el delta y lo aplica mediante incremento atómico. Si el snapshot quedó obsoleto, devuelve un conflicto y la acción administrativa muestra que el stock cambió y pide recargar. El ajuste y el movimiento se crean dentro de la operación transaccional del producto. Referencias: `src/lib/inventario/actualizar-stock-variante.ts:5-47`, `src/lib/services/prendas/actualizar-registro-prenda.ts` y `src/actions/prendas/actualizar-prenda.ts:19-148`.

La eliminación bloquea filas del producto y sus variantes (`FOR UPDATE`) y rechaza variantes con stock positivo, movimientos o items de pedido asociados. Solo deja borrar físicamente variantes sin esas referencias; no implementa archivado lógico. Referencias: `src/lib/inventario/variantes-transaccion.ts:21-76`, `src/lib/services/prendas/eliminar-registro-prenda.ts:5-26`.

Las reservas descuentan stock con una condición de disponibilidad y registran el movimiento en la transacción de creación del pedido. La liberación primero reclama condicionalmente la bandera `Pedido.stockReservado`; solo quien logra cambiarla devuelve cantidades y crea entradas de inventario. Referencias: `src/lib/pedidos/gestionar-reserva-stock.ts:8-107`, `src/lib/pedidos/crear-pedido.ts:38-128`.

**Riesgo residual.** El verificador simula compare-and-set, carreras y bloqueos. La semántica efectiva de `FOR UPDATE`, transacciones y aislamiento todavía debe comprobarse con la versión de MariaDB usada por MYA.

### 3.2 Webhooks de Mercado Pago

**Problema original y causa.** La implementación anterior agrupaba transiciones de pago y cancelación de forma menos específica; en particular, la cancelación podía afectar el pedido sin exigir que el identificador notificado fuera el pago aceptado del pedido. También se necesitaba distinguir un rechazo/cancelación de un reembolso o contracargo posterior a la aprobación.

**Solución actual.** El handler obtiene el tenant del host, exige que el `tenantId` de la notificación coincida con ese tenant activo y procesa/aplica el pago dentro del contexto tenant. El procesador valida la firma HMAC antes de consultar el estado del pago al proveedor, comprueba coherencia del `data.id` y obtiene el estado desde Mercado Pago; el webhook no decide basándose únicamente en el payload. Referencias: `src/app/api/mercadopago/webhook/route.ts:1-16`, `src/lib/pagos/proveedores/mercadopago/crear-handler-webhook-mp.ts:12-37`, `src/lib/pagos/proveedores/mercadopago/crear-procesador-webhook-mp.ts:12-83`.

El aplicador valida pedido, método, `preferenceId`, monto y moneda. Asocia cada intento mediante `Payment.externalId`, con unicidad por proveedor e ID externo; las transiciones se guardan en transacción y con `updateMany` condicionales. Un pago distinto no cancela un pedido aprobado. Reembolso/contracargo requieren el mismo pago aprobado; el pedido no retrocede de `ENTREGADO` ni se devuelve stock automáticamente por una devolución financiera. Una aprobación tardía no reactiva un pedido cancelado: se registra para revisión. Referencia: `src/lib/pagos/aplicar-webhook-pago.ts:56-100,102-440`; la unicidad está en `prisma/schema.prisma:746-762`.

**Riesgo residual.** Los casos de webhook fueron simulados. No se probó firma, consulta remota, entrega duplicada ni eventos concurrentes contra el sandbox real de Mercado Pago. Las reglas actuales registran el reembolso/contracargo y conservan el estado logístico; una política de reposición de stock ante devolución no forma parte de esta corrección.

### 3.3 Disponibilidad de métodos de pago y checkout

**Problema original y causa.** En el historial se observa una lectura de `MetodoPago` que llegó a utilizar el cliente Prisma común en vez de resolver explícitamente la base del tenant, además de consultar el estado de métodos desactivados y volver a leer la configuración de transferencia. Eso podía mezclar el origen de la configuración, generar consultas innecesarias o convertir una configuración ausente en una disponibilidad incorrecta.

**Solución actual.** La lectura de `MetodoPago` se hace con `conPrismaTenant(tenantId, ...)`. El método desactivado se clasifica como `DESACTIVADA` y no consulta su proveedor. Efectivo no requiere conexión externa; transferencia se verifica a partir del `config` ya cargado y requiere instrucciones no vacías; Mercado Pago usa el estado no sensible persistido del tenant para la visualización, sin renovar token ni llamar a la API. Se distinguen estados `DESACTIVADA`, `COMPLETA`, `INCOMPLETA` y `ERROR_TEMPORAL`. Referencias: `src/lib/pagos/obtener-metodos-disponibles.ts:10-143`, `src/lib/pagos/proveedores/transferencia/transferencia-proveedor.ts:40-48`, `src/lib/mercadopago/obtener-estado-cuenta.ts:15-61`.

La regla vigente es efectivo **solo con retiro en tienda**. Checkout y servidor comprueban método disponible, modalidad de entrega, sesión, precios actuales y stock antes de crear el pedido. El método vuelve a validarse al crear el pedido, de modo que una selección manipulada o deshabilitada no basta para completar la operación. Referencias: `src/lib/pagos/es-metodo-pago-compatible-entrega.ts:1-9`, `src/lib/actions/pago/crear-accion-iniciar-pago.ts:67-133`, `src/lib/pedidos/crear-pedido.ts:50-128`.

La disponibilidad administrativa no renueva credenciales. La renovación sigue en el camino operativo de Mercado Pago: `src/lib/mercadopago/obtener-token-acceso.ts:10-22` llama a `renovarTokenMP` si el token venció y hay `refresh_token`; `src/lib/mercadopago/obtener-credenciales.ts:18` utiliza ese resolvedor. La presencia de este camino se confirmó en el código, pero no se probó una renovación real ni un `fetch` de renovación simulado en esta pasada.

La transferencia queda asociada al `Payment` del pedido en `metadata.instrucciones`, y `/mis-pedidos` la recupera solo dentro de la consulta de pedidos del usuario autenticado. Referencias: `src/lib/actions/pago/crear-accion-iniciar-pago.ts:185-208`, `src/app/(tienda)/mis-pedidos/page.tsx:7-12,26-60,85-91`. No se debe consultar ni copiar esa metadata en bruto fuera del tenant porque puede contener información bancaria.

**Configuración real.** No se obtuvo el valor actual de `MetodoPago.activo`, las instrucciones ni la cuenta de Mercado Pago de MYA. En consecuencia, no se afirma que efectivo o transferencia estén habilitados allí. Si falta el registro o `activo=false`, el código no activa el método por defecto.

### 3.4 Transferencias informadas y decisiones administrativas

**Solución actual.** La acción exige sesión y consulta el pedido únicamente en el tenant resuelto; valida que pertenezca al usuario, que sea transferencia, siga pendiente y no haya vencido. La transición condicional `PENDIENTE → EN_ACREDITACION` actualiza pedido y pago y crea un solo `PedidoEvento` con usuario y origen. Repeticiones paralelas no reinician la reserva ni producen un segundo evento. Referencias: `src/lib/actions/pedidos/crear-accion-informar-transferencia.ts:20-122`, `src/actions/pedidos/informar-transferencia.ts:6-25`.

Administración puede listar la revisión con `/admin/orders?revision=transferencias`. El detalle muestra quién informó, la fecha y antigüedad; las acciones requieren `requiereAdmin()` y ejecutan transiciones condicionales en transacción. Rechazar cancela y libera stock una sola vez. Aprobar un pedido pendiente vencido se rechaza; una transferencia informada válidamente antes del límite puede aprobarse después, porque la reserva queda protegida al pasar a `EN_ACREDITACION`. Referencias: `src/app/admin/orders/page.tsx:8-51`, `src/app/admin/orders/[id]/page.tsx:8-36`, `src/actions/pedidos/gestionar-pedidos.ts:36-70`, `src/lib/pedidos/transiciones-pago-manual.ts:13-148`.

### 3.5 Vencimientos configurables y cron

La política se guarda en `MetodoPago.config` por tenant y método. El plazo configurable acepta 1-720 horas; 48 horas es el valor sugerido. La ausencia de la política explícita mantiene pedidos existentes sin fecha límite, por lo que no hay activación ni vencimiento retroactivo. Mercado Pago conserva una reserva de 30 minutos. Referencias: `src/lib/pedidos/politica-reserva-stock.ts:3-69`, `src/components/admin/pagos/ConfiguracionVencimiento.tsx`.

El expirador filtra vencidos mediante una actualización condicional, cancela el pedido/pago, registra evento y libera reserva de forma idempotente. Una transferencia `EN_ACREDITACION` queda fuera de la expiración. El endpoint es `GET /api/cron/expirar-pedidos`, protegido por `Authorization: Bearer <CRON_SECRET>` comparado en tiempo constante. Recorre tenants activos de forma secuencial y devuelve `200` si no hubo fallas, `207` si hubo errores por tenant, `401` por token ausente/incorrecto y `503` ante falta de secreto o error al resolver tenants. Referencias: `src/app/api/cron/expirar-pedidos/route.ts:1-12`, `src/lib/pedidos/crear-handler-cron-expirar-pedidos.ts:16-63`, `src/lib/pedidos/expirar-pedidos-pendientes.ts:18-105`.

**Programación:** la automatización está pospuesta. No existe `vercel.json` en el repositorio y esta revisión no inspeccionó el panel de Vercel; no hay evidencia aquí de que el endpoint se ejecute. La respuesta de un verificador del handler no demuestra ejecución programada. No invocar el endpoint ni habilitar una frecuencia hasta una aprobación específica y una prueba aislada.

### 3.6 Prerenderizado de `/admin/pageConfig` y diagnóstico

La página consulta datos tenant y requiere contexto administrativo. En el código actual declara `export const dynamic = "force-dynamic"`. La ruta está bajo `src/app/admin/layout.tsx`, que llama a `requerirAdministradorTenant()` en servidor y redirige al login si falla; la acción de métodos vuelve a exigir `requiereAdmin()` y resuelve la base del tenant. La acción registra la fase (`autenticacion`, `lectura_tenant`, `estado_proveedores`, `preparacion_respuesta`) y sanitiza los datos del error; al usuario devuelve un mensaje genérico, no métodos ficticios. Referencias: `src/app/admin/pageConfig/page.tsx:7-14`, `src/app/admin/layout.tsx:1-19`, `src/actions/pagos/obtener-metodos-pago.ts:36-114`, `src/lib/pagos/registro-error-seguro.ts`.

El ajuste de código aborda el prerenderizado de una ruta dependiente de la base, pero el build de esta pasada no alcanzó a validar la ruta: falló antes, al crear el árbol `.next`. Por tanto, la desaparición del error original de métodos de pago durante un build completo permanece pendiente de confirmación.

### 3.7 Verificadores y utilidades históricas

`verificar-accion-prenda-tenant.ts` usa la acción inyectable vigente y conserva comprobaciones de autorización, tenant y categoría. Se retiraron `verificar-transferencia-tenant.ts`, `verificar-manifiesto-migracion-tenant.ts` y `verificar-auditoria-relaciones-tenant.ts`, que dependían de `src/lib/tenants/migracion-datos/`, retirado con la herramienta histórica de copia de datos. La justificación está en `scripts/README.md:1-16`; ninguno figura en scripts de `package.json`.

Persisten scripts manuales heredados que no compilan o corresponden al modelo de base compartida/registro local. Entre ellos: `scripts/transferir-datos-tenant.ts` y `scripts/tenants/transferencia/*` importan módulos de migración eliminados; `scripts/inventariar-tenant-origen.ts` y `scripts/tenants/auditar-relaciones-origen.ts` hacen lo mismo; `scripts/verificar-aislamiento-silos.ts`, `scripts/verificar-silos.ts`, `scripts/verificacion-aislamiento.ts` y `scripts/limpiar-enlaces-carrusel.ts` usan `prisma-factory` eliminado; otros verificadores dependen del registro local o aprovisionamiento retirados. `scripts/verificacion-aislamiento/limpiar-contexto.ts` contiene operaciones `deleteMany` para el esquema antiguo: **no ejecutarlo**. `transferir-datos-tenant.ts` conserva un modo `--ejecutar`: no ejecutarlo ni repararlo sin revisión separada. No se consideraron pruebas vigentes.

## 4. Archivos involucrados

Lista de rutas principales, agrupadas por responsabilidad. Los verificadores correspondientes se detallan en la sección 5.

| Área | Archivos principales |
| --- | --- |
| Inventario y productos | `src/actions/prendas/actualizar-prenda.ts`, `src/actions/prendas/eliminar-prenda.ts`, `src/lib/inventario/actualizar-stock-variante.ts`, `src/lib/inventario/variantes-transaccion.ts`, `src/lib/services/prendas/actualizar-registro-prenda.ts`, `src/lib/services/prendas/eliminar-registro-prenda.ts` |
| Pedidos y reservas | `src/lib/pedidos/crear-pedido.ts`, `src/lib/pedidos/gestionar-reserva-stock.ts`, `src/lib/pedidos/expirar-pedidos-pendientes.ts`, `src/lib/pedidos/politica-reserva-stock.ts`, `src/lib/pedidos/transiciones-pago-manual.ts`, `src/actions/pedidos/gestionar-pedidos.ts` |
| Webhook Mercado Pago | `src/app/api/mercadopago/webhook/route.ts`, `src/lib/pagos/proveedores/mercadopago/crear-handler-webhook-mp.ts`, `src/lib/pagos/proveedores/mercadopago/crear-procesador-webhook-mp.ts`, `src/lib/pagos/aplicar-webhook-pago.ts` |
| Métodos y credenciales | `src/lib/pagos/obtener-metodos-disponibles.ts`, `src/lib/pagos/es-metodo-pago-compatible-entrega.ts`, `src/lib/pagos/proveedores/efectivo/efectivo-proveedor.ts`, `src/lib/pagos/proveedores/transferencia/transferencia-proveedor.ts`, `src/lib/mercadopago/obtener-estado-cuenta.ts`, `src/lib/mercadopago/obtener-token-acceso.ts`, `src/actions/pagos/obtener-metodos-checkout.ts`, `src/actions/pagos/obtener-metodos-pago.ts`, `src/actions/pago/iniciar-pago.ts`, `src/lib/actions/pago/crear-accion-iniciar-pago.ts` |
| UI y administración | `src/app/admin/layout.tsx`, `src/app/admin/pageConfig/page.tsx`, `src/components/admin/pagos/SeccionMetodosPago.tsx`, `src/components/admin/pagos/ConfiguracionVencimiento.tsx`, `src/app/(tienda)/mis-pedidos/page.tsx`, `src/components/pedidos/BotonInformarTransferencia.tsx`, `src/app/admin/orders/page.tsx`, `src/app/admin/orders/[id]/page.tsx` |
| Cron y esquema | `src/app/api/cron/expirar-pedidos/route.ts`, `src/lib/pedidos/crear-handler-cron-expirar-pedidos.ts`, `prisma/schema.prisma`, `prisma/migrations-base-unica/` |
| Documentación de utilidades heredadas | `scripts/README.md`; retiro de los tres verificadores indicado en el historial de Git |

## 5. Resultados de pruebas automáticas

### 5.1 Comprobaciones de código

| Comando | Resultado | Alcance y limitación |
| --- | --- | --- |
| `npx tsc --noEmit --incremental false` | **Pasó** (código de salida 0) | TypeScript de la aplicación. |
| `npm run lint` | **Pasó** (código de salida 0) | ESLint y `verificar:imports-prisma`; este último confirmó que PrismaClient se instancia desde el módulo esperado. |
| `npm run build` | **No completó** | `prisma generate` terminó. Next falló con `EPERM` al crear `.next/types/app/api/mercadopago/webhook`; la ACL del sandbox no permite escritura en `.next`. No es un resultado de compilación de la aplicación ni prueba que el error de métodos de pago haya desaparecido. |
| `npx tsc --project tsconfig.scripts.json --noEmit --incremental false` | **Falló por scripts históricos** | Reporta imports inexistentes (`migracion-datos`, `cifrado-registro-local`, `prisma-factory`, aprovisionamiento antiguo), tipos inferidos afectados y scripts que esperan columnas/modelos `tenantId` de la arquitectura compartida. No se ejecutaron esos scripts. |

### 5.2 Verificadores seguros ejecutados

Todos los verificadores siguientes finalizaron con código 0. El comando común para ejecutarlos individualmente es:

```powershell
node --conditions=react-server -r tsconfig-paths/register ./node_modules/ts-node/dist/bin.js --project tsconfig.scripts.json scripts/<archivo>.ts
```

| Verificador / comando | Qué cubre | Datos usados y resultado |
| --- | --- | --- |
| `scripts/verificar-integridad-inventario.ts` (también disponible como `npm run verificar:integridad-inventario`) | Dos ediciones con el mismo snapshot, compra durante edición, liberación repetida, ajuste y no negatividad, variantes con stock/movimientos/pedidos. | Doble Prisma en memoria; pasó. No prueba locks reales de MariaDB. |
| `scripts/verificar-aplicacion-webhook-pago.ts` | Correlación de pago/preferencia, aprobación y duplicados, intento distinto, rechazo, reembolso/contracargo, pedido entregado, aprobación tardía y concurrencia. | Doble transaccional en memoria; pasó. Las líneas de log sobre inconsistencias corresponden a casos negativos simulados. |
| `scripts/verificar-procesamiento-webhook-mp.ts` | Firma HMAC, coherencia del identificador y consulta de pago mediante dependencia inyectada. | `NextRequest`, secreto y proveedor de prueba; pasó. No contactó Mercado Pago. |
| `scripts/verificar-metodos-pago-checkout.ts` | Métodos disponibles, efectivo según entrega, método manipulado, precio/stock y errores de modalidad. | Dependencias de prueba; pasó. |
| `scripts/verificar-estados-configuracion-pagos.ts` | Método inactivo, configuración incompleta, error temporal, sanitización y omisión de consultas innecesarias. | Proveedores falsos; pasó. El `ETIMEDOUT` fue una excepción simulada. |
| `scripts/verificar-transferencias-informadas.ts` | Titularidad, tenant, vencimiento, doble aviso, carrera con expiración, aprobación/rechazo administrativo e idempotencia. | Doble Prisma en memoria; salida confirma que no usó MariaDB ni realizó pagos; pasó. |
| `scripts/verificar-expiracion-reservas.ts` | Política 48 h sugerida, límites 1-720, configuración independiente, no retroactividad, revisión no expirable y liberación idempotente. | Doble Prisma en memoria; pasó. |
| `scripts/verificar-handler-cron-expirar-pedidos.ts` | `Bearer`, secreto ausente/incorrecto, tenants activos, respuesta parcial y aislamiento de errores. | Handler y dependencias simulados; pasó. No invocó la ruta real ni cron. |
| `scripts/verificar-acciones-pago-tenant.ts` | Sesión, método/precio, usuario, tenant y que pedido ajeno no llegue al proveedor. | Prisma/proveedor inyectados; pasó. |
| `scripts/verificar-auth-tenant.ts`, `scripts/verificar-jwt-auth-tenant.ts` | Resolución de host, identidad, tenant suspendido, cookie ligada al tenant y rechazo de cruce entre tenants. | Datos y callbacks de prueba; ambos pasaron. |
| `scripts/verificar-accion-prenda-tenant.ts` | Autorización, categoría existente en el tenant, escritura y caché del tenant correcto. | Dependencias y cliente falsos; pasó. |
| `scripts/verificar-oauth-tenant.ts` | `state`, host, cookie, origen, relay y PKCE S256 de OAuth. | Flujo criptográfico local y archivo de callback; pasó. No comprueba renovación del token. |
| `npm run verificar:core` | Registro/cache de tenant, adaptador y callbacks Auth.js, alta de admin, host de prueba y proveedor Core. | Proveedores, datos y pool simulados; pasó. No consultó Core real. |
| `npm run verificar:entrega` | Combinaciones de domicilio/retiro y disponibilidad del checkout. | Lógica local; pasó. |

No hay un runner general `npm test` configurado en `package.json`; los verificadores se ejecutan con comandos dedicados o `ts-node`. No se ejecutaron los scripts de aislamiento con conexión a silos, herramientas de copia, limpieza ni migración.

## 6. Guía de pruebas funcionales manuales

### 6.1 Preparación segura

Realizar estas pruebas únicamente en staging, con un tenant de prueba separado de producción, usuario comprador y administrador de ese mismo tenant, y un producto/variante descartable con stock suficiente. Usar las instrucciones bancarias autorizadas para staging; no copiar instrucciones de un cliente distinto. Para Mercado Pago, usar credenciales y entorno de prueba autorizados. No transferir dinero real, no ejecutar cron de producción y no modificar pedidos reales.

Antes de empezar, anotar el ID de tenant, producto, variante, pedido y estado inicial de stock. Para concurrencia, disponer de dos sesiones administrativas y dos compradores de prueba. Confirmar que todas las pantallas muestran el host/tenant de staging correcto.

### 6.2 Casos de inventario

| ID | Pasos | Resultado esperado y evidencia |
| --- | --- | --- |
| INV-01 — reserva de compra | Anotar stock de una variante; desde la tienda crear un pedido de prueba con cantidad conocida y pago manual pendiente. | Pedido pendiente con `stockReservado=true`; stock decrementado por la cantidad y movimiento `OUT` del pedido. La reserva se crea dentro de la transacción del pedido. |
| INV-02 — cancelación una vez | En `/admin/orders`, cancelar el pedido INV-01. Volver a intentar cancelarlo. | Primera cancelación devuelve stock y registra la liberación. El segundo intento no aumenta stock ni duplica el movimiento de retorno. Pedido/pago quedan en estado cancelado según acción. |
| INV-03 — formulario desactualizado | Admin A abre editar producto y conserva el snapshot. Antes de guardar, Admin B cambia stock mediante una venta/reserva o ajuste. Admin A envía el formulario sin recargar. | Se muestra conflicto y solicitud de recarga; se conserva el stock posterior al cambio de B y no se registra un delta basado en el snapshot obsoleto. Repetir con dos variantes si se desea. |
| INV-04 — eliminación con referencias | Preparar tres variantes de staging: una con movimiento, una presente en un `PedidoItem` y otra con stock positivo. Intentar eliminar el producto/variantes. Como control, intentar una variante sin stock ni referencias. | Las tres primeras operaciones se rechazan y conservan historial/pedido/stock. Solo la variante sin referencias puede eliminarse físicamente. |
| INV-05 — último stock simultáneo | Dejar una unidad. Dos compradores de prueba intentan crear pedidos de esa unidad al mismo tiempo. | Solo una reserva puede consumir la última unidad; stock nunca negativo y solo un pedido queda reservado para esa unidad. Registrar la prueba por separado en MariaDB: el verificador actual es simulado. |

### 6.3 Checkout y disponibilidad de métodos

| ID | Pasos | Resultado esperado y evidencia |
| --- | --- | --- |
| CHK-01 — efectivo por retiro | En `/admin/pageConfig`, sección «Métodos de pago», habilitar efectivo solo en el tenant de staging. En `/checkout`, elegir retiro; después repetir con domicilio. | Efectivo aparece para retiro y no aparece para domicilio. Intentar enviar manualmente una solicitud con efectivo + domicilio: el servidor debe rechazarla. Las opciones de entrega no deben cambiar por esta validación. |
| CHK-02 — transferencia configurada | Habilitar transferencia y guardar instrucciones bancarias aprobadas para staging. Abrir checkout y crear un pedido pendiente sin realizar una transferencia real. | Transferencia aparece solo cuando está activa y `config.instrucciones` no está vacío. El pedido conserva las instrucciones correctas de ese tenant en `Payment.metadata` y `/mis-pedidos` las muestra al titular. No consultar metadata bancaria en bruto. |
| CHK-03 — método apagado/incompleto | Desactivar transferencia y Mercado Pago, recargar checkout; luego probar transferencia activa sin instrucciones y Mercado Pago activo pero desconectado/incompleto. | Los métodos apagados o incompletos no se ofrecen. El panel administrativo diferencia desactivado, incompleto y error temporal. La disponibilidad no activa métodos automáticamente. |
| CHK-04 — Mercado Pago habilitado | En staging conectar una cuenta de prueba autorizada y activar Mercado Pago explícitamente. Abrir administración/checkout y después, solo si hay autorización para el sandbox, iniciar un pago de prueba. | Aparece cuando el tenant está conectado y el método activo. La lectura administrativa no renueva ni llama al proveedor; la operación real puede renovar mediante `refresh_token`. No aprobar pago real. La renovación automática no quedó cubierta por el verificador ejecutado. |
| CHK-05 — manipulación de total/stock | Abrir checkout, cambiar en staging el precio o stock del producto en otra sesión y enviar el subtotal/cantidad anterior. Repetir modificando la selección de método desde herramientas del navegador. | El servidor recalcula precio/stock y disponibilidad. Si cambió el precio devuelve resumen actualizado; si falta stock o el método no corresponde, no crea pedido ni inicia el proveedor. |

### 6.4 Transferencias y pagos manuales

| ID | Pasos | Resultado esperado y evidencia |
| --- | --- | --- |
| TRF-01 — avisar una vez | Crear pedido de transferencia. Desde `/mis-pedidos`, usar «Ya realicé la transferencia» sin enviar dinero real. Volver a presionar o repetir la solicitud. | Primer aviso cambia a `EN_ACREDITACION`, informa “Pago informado, pendiente de verificación” y registra usuario/fecha. El segundo es idempotente, no modifica vencimiento/reserva y no crea otro evento. |
| TRF-02 — revisión y confirmación | En `/admin/orders`, seleccionar el filtro «Transferencias informadas» (consulta `?revision=transferencias`), abrir el pedido y confirmar. | Se muestra quién informó y antigüedad. La confirmación válida cambia pago a aprobado y pedido a confirmado; conserva el stock ya reservado sin reponerlo. Una transferencia informada antes del límite puede confirmarse aunque la revisión administrativa ocurra después del límite. |
| TRF-03 — rechazo | Crear y avisar otra transferencia. En detalle administrativo, rechazar y después repetir el rechazo y el aviso desde el usuario. | Pedido cancelado y pago rechazado; stock devuelto exactamente una vez. Las acciones repetidas no crean eventos ni reactivan el pedido. |
| TRF-04 — vencido pendiente | En el tenant de prueba activar vencimiento de transferencia de 1 hora. Crear pedido y tratar de avisar justo después de la fecha límite; intentar también aprobar un pedido que nunca se informó y venció. | El servidor rechaza el aviso y la aprobación normal del pendiente vencido. Un pedido que quedó `EN_ACREDITACION` por un aviso válido antes del vencimiento no debe perder reserva por el expirador. |
| TRF-05 — efectivo manual | Crear pedido en efectivo con retiro y aprobar desde administración. Intentar el mismo pago con modalidad domicilio. | El pago en efectivo solo se confirma para retiro conforme a la regla de checkout. No se marca pagado al crear el pedido; requiere confirmación administrativa. |

### 6.5 Política de vencimientos y ejecución del cron

| ID | Pasos | Resultado esperado y evidencia |
| --- | --- | --- |
| EXP-01 — política por tenant/método | En dos tenants de staging, guardar políticas distintas para transferencia/efectivo; comprobar valores mínimo 1, sugerido 48 y máximo 720 horas. Crear pedidos después de cada cambio. | Cada pedido nuevo recibe la fecha límite calculada desde la política de su tenant/método. Cambiar la política no altera `reservaExpiraEn` de pedidos ya creados. |
| EXP-02 — configuración antigua | Usar un tenant de prueba con `MetodoPago.config` sin objeto `vencimiento`; crear o inspeccionar pedidos nuevos. | La UI puede mostrar 48 horas sugeridas, pero la política no queda habilitada y el pedido no recibe vencimiento manual automáticamente. No hay vencimiento retroactivo. |
| EXP-03 — expiración automática | **Pendiente de autorización/configuración de scheduler.** Cuando exista un job aislado aprobado, preparar un pedido de staging vencido y otro en revisión y comprobar expiración/liberación y exclusión del segundo. No enviar solicitud al endpoint durante esta auditoría ni a producción. | El vencido queda cancelado, reserva liberada una vez; `EN_ACREDITACION` conserva su reserva. Consultar el resultado del job y estado del pedido. Hoy solo pasó el verificador unitario del expirador/handler; no hay evidencia de ejecución programada. |

### 6.6 Webhooks y aislamiento multi-tenant

| ID | Pasos | Resultado esperado y evidencia |
| --- | --- | --- |
| MP-01 — webhook en sandbox | En un tenant sandbox autorizado, usar pagos de prueba y notificaciones de sandbox; verificar firma, payment ID, preference ID, monto y moneda. Reentregar la notificación. | Solo se acepta si firma y correlación son válidas. La repetición no duplica transición, evento ni stock. No hacerlo con credenciales/productos de producción. |
| MP-02 — otro intento / reembolso | En sandbox autorizado, aprobar un intento, notificar cancelación/rechazo de otro ID y luego simular reembolso/contracargo del ID aprobado. | El otro intento no cancela el pago aceptado. Reembolso/contracargo afecta el mismo pago y no reactiva ni retrocede el estado logístico; observar la política de revisión. |
| TEN-01 — cruce entre tenants | Iniciar sesión como comprador/admin A e intentar abrir un pedido de B mediante URL/ID o repetir una acción de pago con ese ID. Comparar métodos y stock de ambos tenants antes/después. | A no obtiene datos ni cambia pedido, pago, inventario o config de B. Verificar también que una sesión/cookie de A no se acepte al entrar al host B. |

### 6.7 Consultas SQL de solo lectura para staging

Solo con una sesión de base tenant autorizada en modo lectura. Los nombres de tabla se contrastaron con el baseline del repositorio; no se ejecutaron estas consultas. No mostrar `config` ni `Payment.metadata` en bruto: pueden contener instrucciones bancarias.

```sql
-- Método activo y solo indicadores de presencia de instrucciones/política.
SELECT metodo, activo,
       CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(config, '$.instrucciones')) IS NOT NULL
                  AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(JSON_EXTRACT(config, '$.instrucciones')))) > 0
            THEN 1 ELSE 0 END AS instrucciones_configuradas,
       JSON_UNQUOTE(JSON_EXTRACT(config, '$.vencimiento.habilitado')) AS vencimiento_habilitado,
       JSON_UNQUOTE(JSON_EXTRACT(config, '$.vencimiento.horas')) AS vencimiento_horas
FROM MetodoPago
ORDER BY orden, metodo;

-- Estado del pedido y reserva; sustituir el parámetro por un ID de staging.
SELECT id, estado, estadoPago, metodoPago, metodoEntrega,
       stockReservado, reservaExpiraEn, total, moneda
FROM Pedido
WHERE id = ?;

-- Estado de pago e indicador de que existen instrucciones; nunca extraer el texto.
SELECT proveedor, metodo, estado, externalId, monto, moneda,
       CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.instrucciones')) IS NOT NULL
            THEN 1 ELSE 0 END AS instrucciones_guardadas
FROM Payment
WHERE pedidoId = ?;

-- Historial del pedido y del inventario.
SELECT tipo, estadoAnterior, estadoNuevo, usuarioId, createdAt
FROM PedidoEvento WHERE pedidoId = ? ORDER BY createdAt;
SELECT `type`, quantity, note, createdAt
FROM Movement WHERE variantId = ? ORDER BY createdAt;

-- Columnas reales relevantes a modalidades de entrega en PageConfig.
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'PageConfig'
  AND COLUMN_NAME IN ('envioDomicilioEnabled', 'retiroTiendaEnabled');

-- Historial de migraciones, sin leer logs ni ejecutar cambios.
SELECT migration_name, checksum, started_at, finished_at, rolled_back_at
FROM _prisma_migrations
ORDER BY started_at;
```

Las consultas verifican únicamente la base a la que se conecte la sesión: no demuestran que sea MYA. Antes, confirmar el tenant y la base con el procedimiento de operación de Core, sin imprimir URI, usuario, contraseña o tokens. Si no existe una credencial estrictamente de solo lectura y una ruta que no escriba auditoría en Core, pedir a DBA un reporte de solo lectura; no utilizar `conPrismaTenant` para esta auditoría sin revisar su efecto de auditoría.

## 7. Matriz de trazabilidad

| Problema | Corrección / archivo principal | Prueba automática | Prueba manual | Estado |
| --- | --- | --- | --- | --- |
| Edición de stock desactualizada | Compare-and-set + delta atómico; `actualizar-stock-variante.ts`, `actualizar-registro-prenda.ts` | `verificar-integridad-inventario.ts` | INV-03, INV-05 | Lógica simulada pasó; MariaDB pendiente |
| Borrado de historial/variantes referenciadas | Locks y guardas por stock, movimientos y pedidos; `variantes-transaccion.ts`, `eliminar-registro-prenda.ts` | `verificar-integridad-inventario.ts` | INV-04 | Simulado pasó; FK/locks reales pendientes |
| Reserva/devolución de stock | Reserva y liberación condicional transaccional; `gestionar-reserva-stock.ts`, `crear-pedido.ts` | `verificar-integridad-inventario.ts`, `verificar-expiracion-reservas.ts` | INV-01, INV-02, TRF-03 | Simulado pasó; integración DB pendiente |
| Cancelación por webhook de intento distinto | Correlación de IDs y transición condicionada; `aplicar-webhook-pago.ts` | `verificar-aplicacion-webhook-pago.ts` | MP-01, MP-02 | Simulado pasó; MP sandbox pendiente |
| Firma/correlación del webhook | HMAC, consulta del proveedor y contexto tenant; `crear-procesador-webhook-mp.ts`, ruta API | `verificar-procesamiento-webhook-mp.ts` | MP-01 | Simulado pasó; notificación real pendiente |
| Método desactivado o no configurado | Consulta del tenant; proveedor omitido si está apagado; configuración de transferencia; `obtener-metodos-disponibles.ts` | `verificar-estados-configuracion-pagos.ts`, `verificar-metodos-pago-checkout.ts` | CHK-01 a CHK-04 | Lógica pasó; valores MYA no consultados |
| Efectivo con modalidad incorrecta / payload manipulado | Regla cliente+servidor y revalidación en inicio/creación; `es-metodo-pago-compatible-entrega.ts`, `crear-accion-iniciar-pago.ts` | `verificar-metodos-pago-checkout.ts`, `verificar-acciones-pago-tenant.ts` | CHK-01, CHK-05 | Simulado pasó; UI MYA pendiente |
| Aviso y resolución de transferencia | `EN_ACREDITACION`, ownership/tenant, evento único y acciones admin; `crear-accion-informar-transferencia.ts`, `transiciones-pago-manual.ts` | `verificar-transferencias-informadas.ts` | TRF-01 a TRF-05 | Simulado pasó; flujo UI pendiente |
| Política de vencimiento | JSON por tenant/método, opt-in y no retroactividad; `politica-reserva-stock.ts` | `verificar-expiracion-reservas.ts` | EXP-01, EXP-02 | Lógica pasó; configuración MYA pendiente |
| Cron de expiración | Bearer, tenant activo, errores por silo; route/handler cron | `verificar-handler-cron-expirar-pedidos.ts` | EXP-03 | Handler simulado pasó; scheduler no configurado/verificado |
| Aislamiento tenant | Resolución y clientes tenant-aware; acciones y handlers | `verificar:core`, `verificar-auth-tenant.ts`, `verificar-jwt-auth-tenant.ts`, `verificar-acciones-pago-tenant.ts` | TEN-01 | Dobles pasaron; bases reales pendientes |
| Prerender de `/admin/pageConfig` | `force-dynamic`; acción registra fase segura | `tsc`, `lint`; build bloqueado por `.next` | Abrir página como admin A y sesión no autorizada | Código presente; build completo pendiente |
| Scripts obsoletos | Tres verificadores de herramienta retirada removidos; `scripts/README.md` | Compilación total de scripts falla en otros históricos | No ejecutar los scripts heredados enumerados | Retiro justificado; saneamiento del conjunto histórico pendiente |

## 8. Riesgos y pendientes

1. **MYA real no inspeccionado.** Se desconocen los flags de cada método, las instrucciones bancarias, las políticas por método y el estado/token de Mercado Pago de ese tenant. No asumir que están activos ni desactivados.
2. **DDL e historial reales pendientes.** El repositorio contiene cinco directorios de migración (`20261018000000_baseline`, `20261018010000_admin_pendiente`, `20261020010000_pedidos_envios`, `20261021010000_indices_listados`, `20261022010000_modalidades_entrega`). El baseline incluye campos de reserva y `20261022010000_modalidades_entrega` agrega `envioDomicilioEnabled`; esto no confirma que MYA los haya aplicado. Revisar `PageConfig` e `_prisma_migrations` de MYA solo con acceso de lectura y sin resolver Core mediante una vía que escriba auditoría.
3. **Concurrencia real pendiente.** Las carreras de inventario, webhooks, transferencias y expiración están cubiertas en dobles, pero falta una prueba coordinada contra una base MariaDB descartable con dos transacciones y limpieza controlada.
4. **Build no verificado.** La causa observada es la ACL del sandbox que impide escribir en `.next`. Ejecutar el mismo comando en un workspace de desarrollo con permisos correctos antes del despliegue; comprobar específicamente que no vuelva el error de métodos de pago/prerender.
5. **Renovación de token sin prueba dinámica.** El camino `obtenerTokenAccesoMP → renovarTokenMP` está presente en código, pero faltan pruebas con respuesta HTTP simulada para token vigente, token vencido/renovable, expirado sin refresh token y error de proveedor.
6. **Mercado Pago real/sandbox pendiente.** La verificación realizada usa HMAC local y proveedor inyectado. No hubo llamada a Mercado Pago ni entrega externa de webhooks.
7. **Cron no programado en esta revisión.** El endpoint tiene protección, pero `vercel.json` no existe en el repo y no se revisó la configuración de Vercel. Confirmar plan/frecuencia y registros desde el panel solo cuando se apruebe la automatización. No hay evidencia de ejecución.
8. **Verificadores históricos.** La compilación global de `tsconfig.scripts.json` sigue fallando por herramientas eliminadas y antiguos supuestos de `tenantId`. Algunas utilidades tienen copia o limpieza; mantenerlas fuera de comandos automatizados hasta una decisión específica de retirar/aislarlas.
9. **Formato de configuración bancaria.** La disponibilidad actual valida instrucciones de transferencia no vacías en texto; no comprueba semánticamente banco, CBU/alias o titular. Confirmar que el contrato de configuración actual de MYA sea suficiente sin mostrar esos datos en logs.

## 9. Checklist final de validación

- [x] Inspeccionar Git, modelos, acciones, servicios, UI y verificadores pertinentes.
- [x] TypeScript de aplicación (`npx tsc --noEmit --incremental false`).
- [x] Lint e imports globales de Prisma (`npm run lint`).
- [x] Verificadores locales simulados de inventario, checkout, métodos, webhooks, transferencias, vencimientos y handler cron.
- [x] Verificadores Core/tenant, Auth.js, OAuth y modalidad de entrega.
- [x] No ejecutar pagos, cron, migraciones, limpiezas ni escrituras en bases.
- [ ] Confirmar en MYA configuración de métodos/políticas mediante acceso de solo lectura.
- [ ] Comparar DDL real e historial `_prisma_migrations` de MYA con el esquema Prisma.
- [ ] Ejecutar pruebas de concurrencia con MariaDB aislada.
- [ ] Repetir `npm run build` en un entorno con escritura habilitada en `.next` y comprobar el error de prerender.
- [ ] Probar renovación de token y notificaciones de Mercado Pago en sandbox autorizado.
- [ ] Configurar/verificar scheduler de Vercel únicamente después de autorización.
- [ ] Ejecutar los casos prioritarios de la sección 6 en staging antes del despliegue.

## 10. Conclusión sobre el estado técnico actual

El repositorio contiene protecciones concretas y los verificadores simulados disponibles pasan. El mayor riesgo pendiente no es un fallo lógico reproducido en esta ejecución, sino la falta de evidencia sobre el entorno real: configuración y esquema de MYA, concurrencia en MariaDB, entrega real de webhooks y ejecución del scheduler. El build también debe repetirse fuera del sandbox de solo lectura para confirmar el arreglo de prerenderizado.

Antes de desplegar, conviene priorizar: (1) obtener una comprobación estrictamente de solo lectura del esquema/migraciones y configuración de MYA; (2) recorrer checkout y el ciclo de transferencia en staging; (3) probar concurrencia de stock contra MariaDB aislada; (4) ejecutar Mercado Pago sandbox; y (5) revisar scheduler/logs de Vercel cuando se retome la automatización.
