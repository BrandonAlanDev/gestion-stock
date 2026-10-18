# Gestión Stock

Aplicación de inventario y tienda online en Next.js, Auth.js, Prisma y MySQL/TiDB. Una misma aplicación atiende varios dominios. Logabyte Core resuelve cada dominio a un cliente y entrega, solo al servidor, las credenciales de su base de datos independiente.

## Requisitos

- Node.js 20 o superior.
- Logabyte Core accesible con un token de servicio autorizado para `gestion-stock`.
- Una base MySQL compatible por cliente, con el esquema vigente de `prisma/schema.prisma`.

## Instalación

```bash
npm install
```

Copiá `.env.example` a `.env`. Configurá `LOGABYTE_CORE_URL`, `LOGABYTE_CORE_SERVICE_TOKEN` y `AUTH_SECRET`. El token de servicio de Core debe pertenecer a `gestion-stock` y tener los permisos `RESOLVER_TENANT`, `LISTAR_TENANTS`, `CONSULTAR_ESTADO` y `OBTENER_CREDENCIALES`. Registrá en Core cada dominio DNS y su destino de base. El proceso de Next.js debe poder llegar tanto a Core como a las bases registradas. Completá Google, Cloudinary y Mercado Pago para las funciones que uses.

Para habilitar el registro con Google, configurá `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET` y agregá en Google Cloud la URI de redirección `https://tu-dominio/api/auth/callback/google` (o `http://localhost:3000/api/auth/callback/google` en desarrollo). Cualquier persona puede registrarse; por defecto se crea un usuario `USER`. Si Core reservó ese correo para un administrador Google, el primer acceso con una identidad Google verificada de Gmail o Google Workspace consume la reserva y crea o vincula la cuenta `ADMIN`. Para una cuenta ya registrada por contraseña, iniciá sesión con ella y elegí **Vincular Google** en el menú de la tienda.

```bash
npx prisma generate
npm run dev
```

El servidor usa el encabezado `Host` para buscar el cliente en Core. La primera resolución válida de dominio, ID, estado y credenciales se conserva en memoria del proceso sin vencimiento, por lo que la navegación posterior no consulta Core. Una invalidación explícita o un fallo de conexión al abrir o usar la base obliga a consultar Core nuevamente en el próximo intento. Los dominios desconocidos se reconsultan después de 30 segundos. Si se suspende un cliente, cambia su dominio o se rotan sus credenciales en Core, reiniciá todos los procesos de la aplicación para aplicar el cambio. Las credenciales no se toman del navegador ni de `DATABASE_URL`. Los clientes Prisma se reutilizan por proceso y por versión de credenciales. Las sesiones y los resultados cacheados se vinculan al cliente.

Para probar un dominio registrado en Core mientras abrís la aplicación por `localhost`, configurá `TENANT_TEST_HOSTNAME="dominio.del.cliente"` en `.env` y reiniciá `npm run dev`. Core y esta aplicación deben escuchar en puertos distintos. La sustitución solo se aplica en desarrollo cuando la petición llega por `localhost`, `127.0.0.1`, `::1` o un subdominio `.localhost`. No cambia el origen real del navegador y queda deshabilitada en producción. Dejala vacía para resolver el `Host` recibido normalmente.

Si la instancia local de Core tarda más de 3 segundos por usar una base remota, configurá `LOGABYTE_CORE_TIMEOUT_MS="10000"` en `.env` y reiniciá la aplicación. Este margen solo se aplica en desarrollo (entre 3000 y 30000 ms); producción conserva los límites de 3 segundos para consultas normales y 5 segundos para credenciales. Core debe estar disponible para la primera carga o tras una invalidación; al agotarse el tiempo, la aplicación deniega ese acceso.

## Esquema y migraciones

`prisma/schema.prisma` es la fuente de verdad del esquema de **una base por cliente**. Logabyte Core contiene el catálogo de provisionamiento correspondiente. `prisma.config.ts` usa `DATABASE_URL` solo para apuntar la CLI de Prisma a una base elegida explícitamente; el servidor web no la utiliza.

El baseline activo está en `prisma/migrations-base-unica/`. Para una base nueva y descartable, configurá `DATABASE_URL` con ese destino y ejecutá:

```bash
npx prisma migrate deploy
npx prisma migrate status
```

Para una base con datos, compará antes su DDL y el historial de `_prisma_migrations` con el esquema vigente. Prepará respaldo y reversión antes de aplicar cambios. El catálogo de Core no migra automáticamente bases antiguas. El build genera el cliente Prisma y no modifica bases.

Para crear un administrador, reservá su correo desde el panel de Core. Con **Cuenta de Google**, el titular ingresa por Google y la reserva se consume al crear o vincular su cuenta. Con **Correo y contraseña**, Core muestra un código de invitación una sola vez: compartilo con el titular para que lo ingrese al registrarse y elija una contraseña de al menos 12 caracteres. Las reservas se eliminan después de reclamarse; los usuarios sin reserva se registran como `USER`. La migración `20261018010000_admin_pendiente` crea la tabla de reservas y conserva los administradores Google antiguos sin contraseña para su primer acceso. Aplicá esa migración a bases existentes solo después de revisar DDL, historial, respaldo y reversión.

## Verificación

```bash
npm run verificar:core
npm run lint
npx tsc --noEmit
npm run build
```

La verificación automatizada usa respuestas simuladas de Core. Para comprobar un entorno real, registrá al menos dos dominios con dos bases distintas, abrí ambos sitios y comprobá que los productos y usuarios de uno no aparecen en el otro. Verificá también un dominio desconocido y la suspensión de un cliente. Hacé esta prueba con bases de ensayo o solo lectura; no uses `migrate deploy` sobre bases compartidas sin la revisión anterior.

Para el mapa de componentes, consultá [ARCHITECTURE.md](ARCHITECTURE.md).
