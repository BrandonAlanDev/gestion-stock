# Multi-tenancy

## Modelo operativo

La aplicación usa aislamiento lógico por `tenantId`:

```text
Servicio = unidad de capacidad
Tenant = unidad de aislamiento lógico

1 servicio Next.js
1 PrismaClient singleton y 1 pool
1 base de datos
N tenants aislados dentro de esa base
```

El modelo `Tenant` no conoce el servicio donde está alojado. La única diferencia necesaria entre dos servicios equivalentes es `DATABASE_URL` y las variables de conexión relacionadas. Esto permite exportar un tenant de DB1, importarlo en DB2 y actualizar el routing externo sin modificar el código de la aplicación.

Para conservar sesiones al mover un tenant entre servicios, ambos servicios deben ejecutar el mismo código y compartir `AUTH_SECRET`. Si el secreto cambia, las sesiones existentes dejan de ser válidas y los usuarios deben autenticarse nuevamente.

## Resolución del tenant

El hostname se normaliza en el servidor: minúsculas, sin puerto y sin punto final. La resolución sigue este orden:

1. Coincidencia exacta con `Tenant.dominio`.
2. Un único subdominio de `DOMINIO_PRINCIPAL` que coincida con `Tenant.slug`.
3. En desarrollo local, `{slug}.localhost` resuelve por slug. `localhost`
   busca primero un tenant cuyo dominio sea local y, como respaldo, usa el
   primer tenant activo por fecha de creación. No requiere configurar un ID.
4. Si no hay coincidencia, la solicitud falla cerrada; en producción nunca se usa un tenant por defecto.

Los slugs de infraestructura, como `www`, `api`, `admin`, `app`, `logabyte`, `cdn` y `assets`, están reservados. La lectura de headers ocurre fuera de la función cacheada; el hostname normalizado se pasa como argumento al lookup.

`obtenerTenantPublico()` memoiza por render con `cache()` de React. `resolverTenantPorHost()` usa Data Cache con un TTL corto de 20 segundos. No se mantienen tenants en `Map`, LRU ni estado global del proceso.

## Estados y acceso

- `ACTIVO`: permite tienda y autenticación.
- `SUSPENDIDO`: muestra la pantalla de suspensión y no permite usar la aplicación.
- `INACTIVO`: no expone la tienda.

Las fronteras públicas usan `requiereTenantActivo()`. Las fronteras administrativas usan `requiereAdmin()`, que exige coherencia entre el tenant del hostname, el `tenantId` del JWT/sesión, el usuario real en base de datos y su rol `ADMIN` actual. El rol del token no se considera suficiente por sí solo.

El middleware solo resuelve reglas de sesión y rutas. No usa Prisma, no hace self-fetch y no decide el tenant; los gates que necesitan datos viven en layouts y acciones del servidor.

## Auth.js y usuarios

Los usuarios son completamente independientes por tenant. Las claves relevantes son compuestas:

- `User`: `tenantId + email`.
- `Account`: `tenantId + provider + providerAccountId`.

Por eso el mismo correo y la misma cuenta Google pueden existir en tenants distintos sin enlazar `Account` de un tenant con `User` de otro. El adaptador de Auth.js agrega y valida el tenant en las operaciones de usuario y cuenta. No se habilita `allowDangerousEmailAccountLinking`.

El alta por credenciales siempre crea rol `USER`. Un tenant suspendido o inactivo no puede registrarse ni iniciar sesión.

## Reglas para datos y servicios

Toda entidad de negocio tiene `tenantId` obligatorio. Las unicidades que representan nombres o identidades del negocio son compuestas con el tenant. Las relaciones M:N usan modelos puente explícitos que también contienen `tenantId`.

Reglas para cualquier desarrollo nuevo:

1. Una Server Action o route handler obtiene el tenant exclusivamente del contexto del servidor.
2. Nunca se acepta `tenantId` desde body, `FormData`, query string ni props como autorización.
3. Los servicios reciben `tenantId` explícito y no leen headers, cookies ni sesión.
4. Toda lectura, escritura, actualización y eliminación agrega el tenant a su filtro o valida pertenencia antes de operar.
5. Toda acción administrativa pasa por `requiereAdmin()`.
6. Los identificadores enviados por el cliente se consideran no confiables y se validan contra el tenant antes de relacionarlos.
7. Las operaciones de stock que combinan movimiento y saldo se ejecutan en una transacción.

## Rutas y configuración visual

Las páginas públicas viven en el route group `src/app/(tienda)`, que no altera sus URLs. Su layout aplica en el servidor los gates de tenant, suspensión y mantenimiento. El layout raíz conserva únicamente providers y contexto global compartido.

`PageConfig` es uno a uno por tenant mediante una clave única sobre `tenantId`; su `id` es un entero autoincremental y no tiene significado global. Si todavía no existe configuración, la capa de configuración aplica valores seguros para no romper la aplicación ni la vista.

## Caché y estado del cliente

Las identidades de Data Cache y sus tags incluyen siempre el tenant y todos los parámetros que cambian el resultado. Una clave conceptual sigue esta forma:

```text
tenant:{tenantId}:recurso:{filtros}
```

Las búsquedas de texto arbitrario no ingresan en Data Cache para evitar cardinalidad no acotada. Las mutaciones invalidan tags del tenant real obtenido por el servidor. No existe un recolector manual: se usan TTL, `revalidateTag` y el GC nativo de TanStack Query.

En el cliente, las query keys comienzan con `tenant` y `tenantId`. El carrito, consentimientos, sidebar e índice de búsqueda usan claves de storage separadas por tenant. El `tenantId` del contexto cliente sirve para identidad de UI y caché, nunca para autorizar operaciones del servidor.

## Cloudinary

Los assets nuevos se guardan debajo de:

```text
{tenantId}/garments/...
{tenantId}/carousels/...
{tenantId}/page-config/home-grids/...
{tenantId}/page-config/identidad/...
```

La carpeta se construye en el servidor a partir del tenant autorizado. Los assets históricos no se mueven: el parser acepta las rutas antiguas y las nuevas. Al trasladar un tenant entre servicios, Cloudinary no se migra salvo decisión operativa independiente; las URLs guardadas continúan apuntando al mismo CDN.

## Traslado entre servicios

Procedimiento conceptual para mover un tenant:

1. Detener o bloquear temporalmente escrituras del tenant de origen.
2. Exportar las filas del tenant y sus relaciones desde DB1.
3. Importarlas en DB2 dentro de una transacción y validar conteos, referencias y unicidades.
4. Conservar IDs `String`. Los IDs `Int` pueden requerir remapeo y actualización de referencias durante la importación.
5. Mantener `AUTH_SECRET` si se desea conservar la validez criptográfica de los JWT.
6. Actualizar dominio/subdominio en el routing externo.
7. Aceptar caché fría en el servicio destino; no se transfieren entradas de Data Cache ni TanStack Query.

La operación no requiere cambios en el código ni una relación entre `Tenant` y `Servicio`.

## Esquema: historial y sincronización

El mecanismo operativo actual del proyecto es:

```bash
npx prisma db push
```

Los directorios bajo `prisma/migrations/` documentan el historial SQL y las decisiones de los pasos de transición. Con el flujo actual, ese historial no es la fuente ejecutable de verdad y `db push` no registra migraciones aplicadas. Adoptar `prisma migrate deploy` en el futuro exige una tarea separada para establecer una línea base consistente.

La conversión inicial se hizo en tres actos: columnas nullable conservando unicidades globales; backfill validado hacia el tenant inicial; y finalmente `tenantId` obligatorio, unicidades compuestas y puentes M:N explícitos.

## Verificación

La suite de aislamiento crea dos tenants temporales, ejecuta 15 casos y elimina solamente esos datos:

```bash
npm run verificar:aislamiento
```

Incluye IDOR de lectura/escritura/borrado, unicidades, host y sesión cruzados, estados suspendido/inactivo, caché, query keys, storage, Cloudinary, OAuth, puentes M:N y rechazo de proveedores para un usuario sin rol administrativo.
