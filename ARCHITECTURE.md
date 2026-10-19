# Arquitectura — Gestión Stock

La aplicación sigue siendo un monolito Next.js App Router con React, TypeScript estricto y Prisma. Se despliega una sola aplicación para varios clientes, con una base MySQL compatible por cliente. Logabyte Core conserva el registro central de dominios, estados y referencias de credenciales.

## Capas

- `src/app/`: rutas, layouts y handlers HTTP.
- `src/components/`: interfaz de tienda y administración.
- `src/actions/`: acciones del servidor con validación, permisos e invalidación de caché.
- `src/lib/`: servicios de catálogo, inventario, pedidos, pagos, configuración y conexión a datos.
- `src/lib/tenants/`: resolución de dominio, cliente de Core, contexto de ejecución y administración de pools Prisma.
- `src/hooks/`, `src/contextos/` y `src/types/`: estado y tipos compartidos.

Las operaciones de inventario que cambian stock y movimientos se ejecutan en transacciones. Los flujos de pedidos y pagos validan monto, estado y referencias antes de confirmar una transición; los webhooks verifican su firma y las escrituras son idempotentes.

## Datos y autenticación

`prisma/schema.prisma` define el modelo local de cada cliente. `src/lib/tenants/registry/` consulta el contrato privado v1 de Core, valida sus respuestas y conserva por proceso las resoluciones válidas de dominio, ID, estado y credenciales sin vencimiento. Las credenciales se guardan solo en memoria del servidor, separadas de los metadatos públicos y por identidad y versión de conexión. Las búsquedas sin resultado y el listado vencen a los 30 segundos. Una invalidación explícita o un fallo de conexión al abrir o usar la base descarta las respuestas cacheadas para el próximo intento. La suspensión o un cambio de configuración en Core requiere invalidar la caché de cada proceso o reiniciar la aplicación para verse reflejado. `src/lib/prisma.ts` reutiliza clientes Prisma por cliente y versión de credenciales. El encabezado `Host` determina el cliente de las peticiones públicas; las operaciones internas con un ID confiable lo seleccionan explícitamente.

Auth.js usa un adaptador que opera en la base del cliente. El JWT vincula usuario, cliente y dominio; el middleware protege rutas de gestión y el servidor vuelve a verificar autorización y pertenencia. Las claves y etiquetas de caché de datos incluyen el ID del cliente. El catálogo público selecciona solo campos de tienda y excluye productos inactivos; las consultas de movimientos requieren permisos de administrador.

## Migraciones

`prisma.config.ts` apunta a `prisma/migrations-base-unica/`. `DATABASE_URL` sirve solo para comandos Prisma dirigidos a una base elegida. El catálogo de Logabyte Core provisiona bases nuevas con el mismo baseline. Las bases antiguas requieren una migración evaluada individualmente. Consultá [README.md](README.md).

## Integraciones

- Cloudinary almacena imágenes de productos y configuración.
- Mercado Pago maneja Checkout Pro y OAuth; el callback conserva estado firmado, PKCE y controles de origen. El webhook valida dominio y cliente, firma, monto, moneda y pedido antes de aplicar el pago.
- El cron de expiración usa `CRON_SECRET`, enumera clientes activos desde Core y libera reservas vencidas en cada base.
