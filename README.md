# Gestión Stock

Aplicación de inventario y tienda online en Next.js, Auth.js, Prisma y MySQL/TiDB. Una instancia usa **una sola base de datos** indicada por `DATABASE_URL`.

## Requisitos

- Node.js 20 o superior.
- Una base MySQL, MariaDB o TiDB accesible desde la aplicación.

## Instalación

```bash
npm install
```

Copiá `.env.example` a `.env` y configurá `DATABASE_URL` y `AUTH_SECRET`. Completá las credenciales de Google, Cloudinary y Mercado Pago solo para las funciones que vayas a usar.

```bash
npx prisma generate
npm run dev
```

La aplicación y la CLI usan la misma `DATABASE_URL`. El cliente Prisma se crea una vez por proceso; las solicitudes comparten su pool. El acceso administrativo requiere una sesión vigente con rol `ADMIN`.

## Esquema y migraciones

`prisma/schema.prisma` es la fuente de verdad. `prisma.config.ts` configura las migraciones de `prisma/migrations-base-unica/`.

En una base vacía, aplicá el baseline:

```bash
npx prisma migrate deploy
```

Para reiniciar **solo una base descartable** y perder todos sus datos:

```bash
npx prisma db push --force-reset
npx prisma migrate resolve --applied 20261018000000_baseline
```

Verificá el resultado con `npx prisma migrate status`. El build genera el cliente pero no modifica la base. No apliques el baseline sobre una base con datos sin definir antes una migración de datos específica.

Después de crear una base vacía, configurá `ADMIN_EMAIL` y `ADMIN_PASSWORD` (12 caracteres o más) en el entorno de la terminal y ejecutá `npm run crear:admin`. Podés definir `ADMIN_NAME`; si se omite, usa “Administrador”. El comando crea el primer administrador una sola vez y falla si ya existe uno. No guardes la contraseña en el repositorio.

## Verificación

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Para el mapa de componentes, consultá [ARCHITECTURE.md](ARCHITECTURE.md).
