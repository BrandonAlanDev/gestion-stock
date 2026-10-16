# Arquitectura — Plataforma de E-commerce (multi-tenant)

Documento de referencia de la arquitectura **real y actual** del proyecto. Plataforma de e-commerce
genérica y reutilizable para cualquier rubro (ropa, accesorios, tecnología, alimentos, artesanías,
etc.). Para las reglas de desarrollo vigentes ver `AGENTS.md`.

## Índice

1. [Descripción general](#1-descripción-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [Arquitectura en capas](#4-arquitectura-en-capas)
5. [Base de datos — Modelos Prisma](#5-base-de-datos--modelos-prisma)
6. [Autenticación y protección de rutas](#6-autenticación-y-protección-de-rutas)
7. [Rutas de la aplicación](#7-rutas-de-la-aplicación)
8. [Server Actions y servicios](#8-server-actions-y-servicios)
9. [Componentes por dominio](#9-componentes-por-dominio)
10. [Sistema de imágenes (Cloudinary)](#10-sistema-de-imágenes-cloudinary)
11. [Sistema de temas y apariencia](#11-sistema-de-temas-y-apariencia)
12. [Variables de entorno](#12-variables-de-entorno)
13. [Scripts y comandos](#13-scripts-y-comandos)

---

## 1. Descripción general

Sistema full-stack de **gestión de inventario y e-commerce** construido sobre **Next.js 15 App
Router**, refactorizado para enrutar cada tenant a una base MySQL independiente según el hostname.
En desarrollo usa un registro local cifrado. En producción consume la API privada v1 de Logabyte
Core cuando se configuran sus variables globales. La validación contra Core desplegado y dos
bases de prueba sigue pendiente. Ver `MULTI_TENANCY.md` para el estado.

Dos capas diferenciadas:

- **Panel de administración (ADMIN)**: productos con variantes y stock, categorías y
  subcategorías, proveedores, grupos de talles, colores, movimientos de stock, carruseles,
  páginas dinámicas, configuración visual del sitio, métodos de pago y pedidos.
- **Tienda pública (USER)**: home configurable por secciones, catálogo con filtros y paginación,
  vista de producto con variantes, carrito, checkout y pago (Mercado Pago / transferencia),
  páginas dinámicas y flujo legal (cookies/privacidad/términos).

El modelo de producto es **genérico**: no asume rubro ni atributos específicos de ningún tipo de
tienda.

---

## 2. Stack tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** | 15.2.8 | Framework principal (App Router; `next dev --turbopack`) |
| **React** | 19.x | UI con Server y Client Components |
| **TypeScript** | 5 | Tipado estático (strict) |
| **Prisma** | 7.x | ORM con Driver Adapter nativo para MariaDB |
| **TiDB Cloud / MySQL / MariaDB** | — | TiDB Cloud en el entorno desplegado y MySQL-compatible; `@prisma/adapter-mariadb` |
| **Auth.js (NextAuth)** | 5.0.0-beta.30 | Autenticación: Google OAuth + Credenciales |
| **Tailwind CSS** | 4 | Estilos (`@tailwindcss/postcss`) |
| **Zod** | 4.x | Validación de esquemas en cliente y servidor |
| **Cloudinary** | 2.x | Almacenamiento y CDN de imágenes |
| **Mercado Pago** | — | Pasarela de pagos (Checkout Pro + OAuth) |
| **Sonner** | 2.x | Notificaciones toast |
| **Framer Motion** | 12.x | Animaciones de UI |
| **Lucide React** | 0.562 | Iconos |
| **TanStack React Query** | 5.x | Caché de datos en el cliente |
| **Embla Carousel** | 8.6 | Carruseles |
| **dnd-kit** | core/sortable/utilities | Drag & drop (slides, secciones, grids) |
| **recharts** | 3.9 | Gráficos del dashboard admin |

---

## 3. Estructura de carpetas

```
/
├── AGENTS.md                 # Reglas de desarrollo (idioma, arquitectura, límites)
├── ARCHITECTURE.md           # Este documento
├── MULTI_TENANCY.md          # Guía de multi-tenancy
├── PENDIENTES.md             # Plan de optimización de rendimiento
├── README.md                 # Guía de instalación y puesta en marcha
├── next.config.ts
├── prisma.config.ts
├── eslint.config.mjs
├── package.json
│
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos (fuente de verdad)
│   └── migrations/           # Migraciones SQL
│
├── generated/prisma/         # Cliente Prisma generado — NO editar manualmente
│
├── scripts/
│   ├── limpiar-enlaces-carrusel.ts
│   ├── verificar-silos.ts          # Verificación de conexión y esquema por silo
│   └── verificacion-aislamiento/   # Verificación heredada de filtros tenantId
│
└── src/
    ├── auth.ts               # Instancia NextAuth (Google + Credentials + adapter Prisma)
    ├── auth.config.ts        # Config edge-compatible para middleware
    ├── middleware.ts         # Protección de rutas por rol
    │
    ├── app/                  # Rutas Next.js App Router
    │   ├── (tienda)/         # Zona pública
    │   ├── admin/            # Panel de administración
    │   └── api/              # Route handlers
    ├── actions/              # Server Actions por dominio
    ├── components/           # Componentes React por dominio
    ├── contextos/            # Contextos React (carrito, capas, tenant, config)
    ├── helpers/              # Utilidades de resolución de enlaces
    ├── hooks/                # Hooks (TanStack Query + utilidades)
    ├── lib/                  # Lógica compartida y servicios
    ├── providers/            # Proveedores globales (QueryProvider)
    └── types/                # Tipos globales y augmentación de next-auth
```

El cliente Prisma se genera en `/generated/prisma` (raíz del repo) y el código lo importa desde
`generated/prisma/client`.

---

## 4. Arquitectura en capas

```text
UI (pages + components)
  -> Server Actions (src/actions): validan Zod, autentican, manejan errores, invalidan caché
    -> Servicios (src/lib/services): queries de Prisma puras, sin lógica de negocio
      -> Resolver de tenant: hostname -> registro central cacheado
        -> Fábrica Prisma tenant-aware (pool limitado y clientes reutilizables)
          -> Base MySQL independiente del tenant
```

| Capa | Responsabilidad |
|---|---|
| **UI (pages + components)** | Renderizado, interacción, estados locales. `"use client"` solo cuando es necesario. |
| **Server Actions (`src/actions`)** | Interfaz pública de negocio: validan con Zod, autentican con `auth()`, manejan errores, llaman `revalidateTag`/`revalidatePath` y devuelven `{ ok, error }`. |
| **Servicios (`src/lib/services`)** | Queries de Prisma puras y reutilizables. |
| **Resolución (`src/lib/tenants/`)** | Normaliza el host y consulta `TenantRegistryProvider`; el runtime local usa un registro cifrado y producción usa el cliente HTTP privado de Logabyte Core. |
| **Acceso a datos (`src/lib/tenants/prisma-factory.ts`)** | `conPrismaTenant(tenantId, fn)` resuelve el destino desde el registro del servidor y conserva un cliente por tenant con límites de clientes, pools, leases y expiración. No existe un cliente comercial global. |
| **Base de datos** | Relacional con `relationMode = "prisma"` (relaciones simuladas, sin FKs nativas). |

> **Nota:** las acciones y servicios usan `conPrismaTenant` para consultas puntuales o no cacheadas. Los servicios reutilizables reciben el cliente o el `tenantId` explícitamente; no importan una instancia Prisma global.

---

## 5. Base de datos — Modelos Prisma

### Configuración

- Provider `mysql` con `relationMode = "prisma"`.
- Cliente generado en `/generated/prisma`.
- Cada tenant recibe el mismo schema y las mismas migraciones.
- El modelo `Tenant` y las columnas `tenantId` siguen presentes por compatibilidad durante la migración de datos; el aislamiento runtime también se aplica por base.
- `PageConfig` conserva su unicidad heredada sobre `tenantId` hasta una migración posterior.

### Modelos por dominio

**Multi-tenancy y autenticación**
- `Tenant`, `user`, `account` (estándar next-auth con `tenantId`).

**Catálogo (genérico)**
- `Category`, `SubCategory`, `Garment` (producto), `GarmentImage`.
- `GarmentVariant` (variante con stock/SKU), `GarmentOption` + `GarmentOptionValue` +
  `GarmentVariantOptionValue` (sistema genérico de opciones y variantes).
- `SizeType`, `Size`, `Color`.
- `Provider`, `ContactProvider`, `Movement` (entrada/salida de stock).

**Configuración del sitio**
- `PageConfig` (identidad, colores, contacto, redes, moneda, SEO, legales, footer, estilos),
  `Banner`, `Carousel` + `CarouselSlide`, `Homegrid` + `Grid`, `CustomPage` + `CustomSection` +
  `CustomSectionItem`.

**Pagos y pedidos**
- `CuentaMercadoPago`, `Pedido` + `PedidoItem`, `MetodoPago`, `Payment`.

---

## 6. Autenticación y protección de rutas

- `src/auth.config.ts`: config edge-compatible (Google + sesión JWT + callbacks).
- `src/auth.ts`: instancia final con adapter y provider `Credentials` sobre la base del hostname.
- `src/middleware.ts`: protección por rol (`ADMIN`), whitelist de rutas `/admin` y comprobación del hostname asociado al JWT.
- La zona `/admin` valida sesión y rol `ADMIN` también en `src/app/admin/layout.tsx`.

Los roles se guardan en el token JWT. El token queda asociado al hostname que inició sesión; el
middleware exige que coincida con `Host`. El callback de servidor además comprueba que `tenantId`
coincida con el tenant resuelto y relee el usuario en su base. Las consultas heredadas también
mantienen filtros `tenantId` mientras se migra el modelo.

---

## 7. Rutas de la aplicación

**Públicas**
- `/` — home configurable.
- `/productos`, `/productos/[categoria]`, `/productos/item/[id]`.
- `/checkout`, `/pago/exito`, `/pago/pendiente`, `/pago/error`.
- `/page?title=<slug>` — páginas dinámicas.
- `/login`, `/register`, `/mantenimiento`, `/404`.

**Administración**
- `/admin` (dashboard), `/admin/productos`, `/admin/categories`, `/admin/provider`,
  `/admin/sizes`, `/admin/movements`, `/admin/custom-page`.
- `/admin/design` (+ `apariencia`, `contenido`, `estructura`).
- `/admin/pageConfig`.

**API**
- `/api/auth/[...nextauth]`, `/api/carousels`, `/api/home-config/*`,
  `/api/upload-image`, `/api/mercadopago/*`.

---

## 8. Server Actions y servicios

- `src/actions/`: por dominio (`categories`, `colors`, `garments`, `sizes`, `productos`,
  `search`, `custom-page*`, `carousel`, `carrito`, `pago`, `pagos`, `pedidos`, `proveedores`,
  `movimientos`, `estadisticas`, `home-config`, `page-config/*`, `sesion`, `mercadopago`).
- `src/lib/services/`: `category-service`, `color-service`, `size-service`, `garment-service`,
  `garment-admin-service`, `garment-options-service`, carruseles, proveedores, movimientos,
  estadísticas e imágenes Cloudinary.
- Caché de servidor con `unstable_cache` (`src/lib/cache.ts`) y de cliente con TanStack Query.

---

## 9. Componentes por dominio

`src/components/` incluye, entre otros: `admin/` (productos, categorías, proveedores, talles,
carrusel, custom-page, design, page-config, pagos, configuracion), `carousel/`, `carrito/`,
`cart/`, `categories/`, `checkout/`, `custompage/`, `dashboard/`, `footer/`, `home/`, `imagen/`,
`layout/`, `legal/`, `mantenimiento/`, `movements/`, `not-found/`, `providers/`, `search/`,
`tenants/`, `tienda/` y `ui/`.

---

## 10. Sistema de imágenes (Cloudinary)

- Integración genérica en `src/lib/cloudinary.ts` y `src/lib/services/imagenes-cloudinary/`.
- Los assets nuevos viven bajo `{tenantId}/...`, lo que garantiza aislamiento entre tiendas.
- Las URLs históricas siguen sirviendo imágenes, pero los IDs antiguos sin propietario verificable
  no se pueden mover ni eliminar desde el panel de ninguna tienda.
- Carpetas: `page-config/identidad`, `page-config/home-grids/{id}`, `carousels/{id}`,
  `garments/{categoria}/{producto}`.
- Cada tienda carga su propio logo, favicon, banners, imágenes de producto y contenido visual.

---

## 11. Sistema de temas y apariencia

- `PageConfig` define identidad, colores, tipografías, bordes, sombras, densidad y orden de
  secciones.
- `src/lib/apariencia/` normaliza la configuración y aplica variables de tema
  (`normalizar-config-apariencia.ts`, `obtener-variables-tema.ts`,
  `aplicar-tipografia-documento.ts`).
- `src/components/apariencia/` carga las fuentes de Google seleccionadas.

---

## 12. Variables de entorno

```env
# Prisma CLI (base elegida explícitamente para generar o migrar)
DATABASE_URL

# Autenticación
AUTH_SECRET, AUTH_TRUST_HOST, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

# Cloudinary
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# Registro local cifrado y límites compartidos por instancia
TENANT_REGISTRY_FILE, TENANT_REGISTRY_ENCRYPTION_KEY
TENANT_PRISMA_MAX_CLIENTS, TENANT_PRISMA_CONNECTION_LIMIT, TENANT_PRISMA_IDLE_TTL_MS

# Mercado Pago (Checkout Pro + OAuth)
MP_CLIENT_ID, MP_CLIENT_SECRET, MP_AUTH_BASE_URL, MP_WEBHOOK_SECRET, MP_REDIRECT_URI

# App
NEXT_PUBLIC_APP_URL
```

Ver `.env.example` para el detalle.

---

## 13. Scripts y comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack). |
| `npm run build` | `prisma generate` + `next build`; no cambia ninguna base. |
| `npm run start` | Servidor de producción. |
| `npm run lint` | ESLint. |
| `npm run verificar:silos` | Compara bases, esquema Prisma e historial de migraciones de tenants de prueba; es de solo lectura. |
| `npm run verificar:historial-migraciones` | Prueba la comparación de checksums versionados sin conectar a MySQL. |
| `npm run verificar:preflight-migraciones` | Prueba las guardas del runner de migraciones sin conectar a MySQL. |
| `npm run verificar:factory-tenant` | Prueba límites, leases y reutilización de clientes con dobles en memoria. |
| `npm run verificar:aislamiento` | Prueba filtros heredados en una base local `_test` con opt-in y confirmación exacta del destino; no comprueba silos físicos. |
| `npm run verificar:silos:reales` | Levanta dos MySQL descartables y comprueba schema e independencia física; requiere Docker Compose. |
| `npm run verificar:guardas-aislamiento-silos` | Prueba offline las guardas de destino local y confirmación exacta. |
| `npm run verificar:acciones-pago-tenant` | Comprueba el enrutamiento por tenant de las Server Actions de pago con dependencias aisladas. |
| `npm run registro:local:cifrar` | Cifra por stdin el registro de desarrollo. |
