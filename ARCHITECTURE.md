# Arquitectura — Gestión Stock

La aplicación es un monolito Next.js App Router con React, TypeScript estricto, Prisma y una base MySQL compatible por despliegue. `DATABASE_URL` determina la conexión de la aplicación y de Prisma CLI.

## Capas

- `src/app/`: rutas, layouts y handlers HTTP.
- `src/components/`: interfaz de tienda y administración.
- `src/actions/`: acciones del servidor con validación, permisos e invalidación de caché.
- `src/lib/`: servicios de catálogo, inventario, pedidos, pagos, configuración y conexión a datos.
- `src/hooks/`, `src/contextos/` y `src/types/`: estado y tipos compartidos.

Las operaciones de inventario que cambian stock y movimientos se ejecutan en transacciones. Los flujos de pedidos y pagos validan monto, estado y referencias antes de confirmar una transición; los webhooks verifican su firma y las escrituras son idempotentes.

## Datos y autenticación

`prisma/schema.prisma` define el modelo de datos. `src/lib/prisma.ts` crea y reutiliza el cliente Prisma único. La conexión usa TLS cuando `DATABASE_URL` declara `sslaccept=strict` o `sslmode=require`.

Auth.js usa el adaptador Prisma estándar. El inicio con credenciales busca por email único, y el JWT refresca el rol del usuario desde la base. El middleware protege las rutas de gestión por sesión y rol; la autorización definitiva ocurre en el servidor.

## Migraciones

`prisma.config.ts` apunta a `prisma/migrations-base-unica/`. El baseline crea la base desde cero. Consultá [README.md](README.md) para los comandos.

## Integraciones

- Cloudinary almacena imágenes de productos y configuración.
- Mercado Pago maneja Checkout Pro y OAuth; el callback conserva estado firmado, PKCE y controles de origen. El webhook valida firma, monto, moneda y pedido antes de aplicar el pago.
- El cron de expiración usa `CRON_SECRET` y libera reservas vencidas de la base única.
