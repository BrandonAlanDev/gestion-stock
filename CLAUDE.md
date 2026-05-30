## Descripción General del Proyecto

Sistema full-stack de **gestión de inventario y e-commerce** construido sobre Next.js 15 App Router. El negocio es **NewSurfBoard**, una tienda de surf en Mar del Plata, Argentina.

El sistema tiene dos capas diferenciadas:
- **Panel de administración (ADMIN)**: inventario de productos, categorías, subcategorías, proveedores, grupos de talles, colores, movimientos de stock, configuración visual del sitio y gestión de usuarios.
- **Tienda pública (USER)**: catálogo con filtros, carrito lateral, vista de producto con variantes (talle/color), páginas de categorías, escuela de surf y diseñador de tablas personalizadas.

---

## Stack Tecnológico Completo

| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** | 15.2.8 | Framework principal (App Router, Turbopack en dev) |
| **React** | 19.x | UI con Server y Client Components |
| **TypeScript** | 5 | Tipado estático (strict mode) |
| **Prisma** | 7.2+ | ORM con Driver Adapter nativo para MariaDB |
| **MySQL / MariaDB** | — | Base de datos relacional |
| **Auth.js (NextAuth)** | 5 beta.30 | Autenticación (Google OAuth + Credenciales) |
| **Tailwind CSS** | 4 | Estilos con `@tailwindcss/postcss` |
| **Zod** | 4.3+ | Validación de esquemas en cliente y servidor |
| **Cloudinary** | 2.x | Almacenamiento y CDN de imágenes |
| **Sonner** | 2.x | Notificaciones toast |
| **Framer Motion** | 12.x | Animaciones de UI |
| **Lucide React** | 0.562 | Librería de iconos |
| **bcryptjs** | 3.x | Hash de contraseñas |
| **TanStack Query (React Query)** | — | Caché del cliente en el dashboard admin |
| **CVA (class-variance-authority)** | — | Variantes del componente Button |
| **slugify** | 1.6 | Slugs para carpetas de Cloudinary |
| **date-fns / date-fns-tz** | 4 / 3 | Manejo de fechas y zonas horarias |
| **use-debounce** | 10 | Debounce en búsqueda del admin |
| **embla-carousel-react** | 8.6 | Carrusel (instalado, uso pendiente) |

---

## Estructura Completa de Archivos

```
/
├── prisma/
│   ├── schema.prisma               # Esquema de base de datos
│   ├── config.ts                   # Configuración de Prisma (datasource, migrations)
│   └── migrations/
│       └── 0_init/migration.sql    # Migración inicial (users + accounts)
│
├── generated/
│   └── prisma/                     # Cliente Prisma generado (NO editar)
│       └── client/                 # Se regenera con `npx prisma generate`
│
├── src/
│   ├── app/                        # Rutas Next.js (App Router)
│   │   ├── globals.css             # Variables CSS, fuentes, animaciones, scrollbar
│   │   ├── layout.tsx              # Layout raíz: session + branding + pageConfig + providers
│   │   ├── loading.tsx             # Spinner global de carga
│   │   ├── page.tsx                # "/" → HomeClient → ProductLayout
│   │   │
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/
│   │   │       └── route.ts        # Handler de Auth.js (GET + POST)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx            # Página de login (Client Component)
│   │   ├── register/
│   │   │   └── page.tsx            # Página de registro (Client Component)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Wrappea con QueryProvider (TanStack Query)
│   │   │   └── page.tsx            # → DashboardClient (inventario admin)
│   │   │
│   │   ├── categories/
│   │   │   └── page.tsx            # Gestión de categorías (force-dynamic, Server Component)
│   │   ├── provider/
│   │   │   └── page.tsx            # Gestión de proveedores (Client Component + Suspense)
│   │   ├── sizes/
│   │   │   └── page.tsx            # Gestión de grupos de talles (Client Component)
│   │   ├── movements/
│   │   │   └── page.tsx            # Historial de movimientos (Server Component)
│   │   │
│   │   ├── productos/
│   │   │   ├── page.tsx            # Catálogo general paginado
│   │   │   ├── [categoria]/
│   │   │   │   └── page.tsx        # Catálogo por categoría (SSG + ISR)
│   │   │   └── item/[id]/
│   │   │       └── page.tsx        # Detalle de producto
│   │   │
│   │   ├── personalizado/
│   │   │   └── page.tsx            # Diseñador de tablas (Client Component puro)
│   │   ├── escuela/
│   │   │   └── page.tsx            # Landing escuela de surf (Server Component)
│   │   │
│   │   └── admin/
│   │       └── pageConfig/
│   │           └── page.tsx        # Configuración visual del sitio (Server + Client)
│   │
│   ├── actions/                    # Server Actions — toda la lógica de negocio
│   │   ├── admin.actions.ts        # Turnos: obtenerTurnos, limpiarTurnosAntiguos, limpiarTurnosCancelados
│   │   ├── admin-dashboard.ts      # Usuarios: getAllUsers, toggleUserRole, deleteUserAccount
│   │   ├── auth-actions.ts         # loginAction, registerAction, googleLoginAction, handleSignOut
│   │   ├── categories.ts           # getCategories (cacheada), createCategory, updateCategory, deleteCategory, createSubCategory, deleteSubCategory
│   │   ├── colors.ts               # getColors (cacheada), createColor
│   │   ├── garments.ts             # createGarment, getGarments (paginado+cacheado), getGarmentById, updateGarment, deleteGarment
│   │   ├── movements.ts            # createMovement (con transacción), getMovements
│   │   ├── providers.ts            # getProviders (cacheada), createProvider, updateProvider, deleteProvider
│   │   ├── sizes.ts                # getSizeTypes (cacheada), createSizeType, addSizeToType, deleteSize, deleteSizeType
│   │   ├── user-dashboard.ts       # updateProfile, getUserTurnos, cancelTurno, updatePassword
│   │   └── page-config/
│   │       ├── branding.actions.ts  # updateBrandingConfig (sube imgs), getBrandingConfig (cacheada 1h)
│   │       ├── contact.actions.ts   # updateContactConfig, getContactConfig
│   │       ├── ecommerce.actions.ts # updateEcommerceConfig, getEcommerceConfig
│   │       ├── general.actions.ts   # getPageConfig (consulta directa sin caché)
│   │       ├── helpers.ts           # generateSeoImageData (genera ruta+ID para Cloudinary)
│   │       ├── location.actions.ts  # updateLocationConfig, getLocationConfig
│   │       ├── maintenance.actions.ts # clearPageConfig (limpia imágenes en Cloudinary + reset DB)
│   │       ├── seo.actions.ts       # updateSeoConfig, getSeoConfig
│   │       ├── socials.actions.ts   # updateSocialsConfig, getSocialsConfig
│   │       └── shared/
│   │           ├── defaults.ts      # DEFAULT_VALUES para reset de PageConfig
│   │           ├── get-page-config.ts # getOrCreatePageConfig (upsert del registro id=1)
│   │           ├── reset-data.ts    # RESET_DATA: objeto completo para resetear PageConfig
│   │           ├── types.ts         # PageConfigInput: tipo TS para las mutaciones
│   │           └── upload-page-image.ts # uploadPageImage: sube/reemplaza imagen en Cloudinary
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   └── page-config/        # Secciones del panel /admin/pageConfig
│   │   │       ├── BrandingSection.tsx    # Logo, banner, favicon, nombre, slogan, desc, colores
│   │   │       ├── ContactSection.tsx     # Teléfono, WhatsApp, email
│   │   │       ├── EcommerceSection.tsx   # SwitchCards: ecommerce/carrito/checkout
│   │   │       ├── LocationSection.tsx    # Dirección, ciudad, provincia, país + switch habilitado
│   │   │       ├── PageConfigForm.tsx     # Contenedor que compone todas las secciones
│   │   │       ├── SeoSection.tsx         # Meta title y meta description
│   │   │       ├── SocialsSection.tsx     # Instagram, Facebook, TikTok, X, YouTube, LinkedIn
│   │   │       └── shared/
│   │   │           ├── ImageUploader.tsx  # Carga imagen como base64 (para branding)
│   │   │           ├── Input.tsx          # Input estilizado admin (dark)
│   │   │           ├── SwitchCard.tsx     # Toggle switch con card negro/cyan
│   │   │           └── Textarea.tsx       # Textarea estilizado admin (dark)
│   │   │
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx       # Layout con imagen de fondo, blur, neón
│   │   │   ├── google-button.tsx    # Botón Google con useFormStatus (form action)
│   │   │   └── LoginModal.tsx       # Modal de login que aparece en header
│   │   │
│   │   ├── cart/
│   │   │   └── CartSidebar.tsx      # Panel lateral carrito: items, cantidades, totales, link a pago
│   │   │
│   │   ├── categories/
│   │   │   ├── filters/
│   │   │   │   └── CategoryFilter.tsx    # Select de filtro por categoría (dashboard)
│   │   │   ├── forms/
│   │   │   │   └── AddSubCategoryForm.tsx # Form rápido para añadir subcategoría en /categories
│   │   │   ├── modals/
│   │   │   │   ├── CategoryModal.tsx          # Modal ADMIN OSCURO (estilo amber, para dashboard)
│   │   │   │   ├── DeleteSubBtn.tsx            # Botón cliente que llama deleteSubCategory
│   │   │   │   └── ManageCategoryModal.tsx     # Modal TIENDA (estilo cyan, para /categories)
│   │   │   └── view/
│   │   │       └── CategoryContentClient.tsx  # Vista de categoría: sidebar subs + grilla productos
│   │   │
│   │   ├── data/
│   │   │   └── data.js              # Datos estáticos: categorías mock, products mock, heroSlides
│   │   │
│   │   ├── home/
│   │   │   ├── HomeClient.tsx       # Wrapper cliente para la página de inicio
│   │   │   └── HomeSections.jsx     # Grid de 7 categorías animadas (FeaturedSection)
│   │   │
│   │   ├── layout/
│   │   │   ├── AppGate.tsx          # Controla flujo cookies → privacidad → términos → app
│   │   │   ├── Footer.tsx           # Footer público: links, redes, términos, privacidad
│   │   │   ├── Header.tsx           # Navbar fijo: logo, menú hamburguesa, links admin/user, logout
│   │   │   ├── Hero.tsx             # Carrusel hero: slides dinámicos del pageConfig + estáticos
│   │   │   ├── LayoutComponent.tsx  # Provider de carrito + AppLayout interno
│   │   │   └── RouteLoader.tsx      # Barra cyan de carga en cambios de ruta (Framer Motion)
│   │   │
│   │   ├── legal/
│   │   │   ├── CookieModal.tsx      # Modal de cookies (bloquea toda la app hasta aceptar)
│   │   │   ├── PrivacyModal.tsx     # Modal privacidad (automático tras cookies)
│   │   │   └── TermsModal.tsx       # Modal términos (requiere checkbox para aceptar)
│   │   │
│   │   ├── movements/
│   │   │   └── MovementModal.tsx    # Modal para registrar ingreso/egreso de stock
│   │   │
│   │   ├── products/
│   │   │   ├── cards/
│   │   │   │   └── ProductCard.tsx     # Tarjeta: hover slider de imágenes, badge nuevo/sin stock
│   │   │   ├── forms/
│   │   │   │   ├── ImageUploader.tsx   # Sube imágenes a Cloudinary (upload preset público)
│   │   │   │   └── VariantRow.tsx      # Fila de variante: talle, color, stock, SKU + custom
│   │   │   ├── grid/
│   │   │   │   └── ProductGrid.tsx     # Grilla de productos + modal de detalle rápido
│   │   │   ├── layouts/
│   │   │   │   └── ProductLayout.jsx   # Layout principal de la tienda home (JSX, usa datos mock)
│   │   │   ├── modals/
│   │   │   │   ├── ProductModal.tsx    # Modal CRUD de productos (con createPortal)
│   │   │   │   ├── ProviderModal.tsx   # Modal de info de proveedor (readonly)
│   │   │   │   └── QuickViewTable.tsx  # Tabla del inventario con editar/eliminar
│   │   │   └── views/
│   │   │       ├── CatalogoClient.tsx  # Wrapper cliente para catálogo (pasa addToCart)
│   │   │       ├── ProductoView.tsx    # Vista detalle: galería, talles, colores, carrito
│   │   │       └── ProductsPage.tsx    # Catálogo con sidebar de filtros, orden y paginación
│   │   │
│   │   ├── providers/
│   │   │   ├── PageConfigProvider.tsx  # Context global de la config del sitio
│   │   │   └── SessionWrapper.tsx      # SessionProvider de NextAuth (envuelve la app)
│   │   │
│   │   ├── search/
│   │   │   └── Search.tsx             # Input con debounce 300ms, llama onChange del padre
│   │   │
│   │   └── ui/
│   │       ├── button.tsx             # Botón con múltiples variantes (CVA + Radix Slot)
│   │       ├── color-dropdown.tsx     # Dropdown custom de colores con punto de color
│   │       ├── confirm-dialog.tsx     # Diálogo de confirmación (eliminar producto)
│   │       ├── input.tsx              # Input base de shadcn/ui
│   │       └── pagination.tsx         # Paginación con Links de Next.js y searchParams
│   │
│   ├── context/
│   │   └── CartContext.tsx            # Estado global del carrito con localStorage
│   │
│   ├── hooks/                         # Custom hooks (todos client-side con TanStack Query)
│   │   ├── useCategories.ts           # getCategories → queryKey: ["categories"], staleTime: Infinity
│   │   ├── useColors.ts               # getColors → queryKey: ["colors"], staleTime: Infinity
│   │   ├── useGarments.ts             # getGarments paginado → queryKey: ["garments", params]
│   │   ├── useProductForm.ts          # Lógica completa del form de producto (sin componente)
│   │   ├── useProviders.ts            # getProviders → queryKey: ["providers"], staleTime: Infinity
│   │   └── useSizeTypes.ts            # getSizeTypes → queryKey: ["sizeTypes"], staleTime: Infinity
│   │
│   ├── lib/
│   │   ├── cache.ts                   # Sistema de caché con unstable_cache + tags
│   │   ├── cloudinary.ts              # Config v2 + extractPublicId()
│   │   ├── prisma.ts                  # Singleton PrismaClient con adapter MariaDB
│   │   ├── upload-image.ts            # Helper: sube imagen base64 a Cloudinary como webp
│   │   ├── utils.ts                   # cn() + serializeData() + extractPublicId()
│   │   ├── zod.ts                     # Todos los esquemas de validación
│   │   └── services/                  # Capa de servicio — queries a Prisma puras
│   │       ├── category-service.ts    # getCategoriesFull, createCategory, updateCategory, deleteCategory, getSubCategoriesCount, createSubCategory, deleteSubCategory, getCategoryWithProducts, getCategoryByName, getGarmentCountBySubCategory
│   │       ├── color-service.ts       # getColors, createColor
│   │       ├── garment-service.ts     # getGarmentsPaginated, getGarmentById, createGarment, updateGarment, deleteGarment, updateGarmentWithDetails
│   │       ├── provider-service.ts    # getProviders, createProvider, updateProvider, deleteProvider
│   │       └── size-service.ts        # getSizeTypes, createSizeType, addSize, deleteSize, deleteSizeType
│   │
│   ├── providers/
│   │   └── QueryProvider.tsx          # QueryClientProvider de TanStack Query
│   │
│   ├── types/
│   │   └── next-auth.d.ts             # Extiende tipos de NextAuth: id, role, telefono, image
│   │
│   ├── auth.ts                        # Config principal Auth.js (providers, callbacks)
│   ├── auth.config.ts                 # Config edge Auth.js (para middleware, sin Node.js)
│   └── middleware.ts                  # Protección de rutas por rol
│
├── CLAUDE.md                          # Este archivo
├── next.config.ts                     # Config Next.js (eslint ignorado, imágenes remotas)
├── postcss.config.mjs                 # Plugin Tailwind v4
├── tsconfig.json                      # TypeScript strict mode
├── prisma.config.ts                   # Datasource de Prisma desde env vars
├── eslint.config.mjs                  # ESLint flat config (next/core-web-vitals)
└── package.json                       # Scripts: dev, build (prisma generate + push + build)
```

---

## Sistema de Caché con Tags (CRÍTICO)

El proyecto usa **dos capas de caché independientes** que deben entenderse bien para evitar datos desactualizados.

### Capa 1: `unstable_cache` de Next.js (servidor)

Definida en `src/lib/cache.ts`. Cachea los resultados de las queries de Prisma en el servidor.

```typescript
// src/lib/cache.ts — resumen del sistema

// Cacheada 1 hora (3600s)
export const getCachedPageConfig = unstable_cache(
  async () => prisma.pageConfig.findUnique({ where: { id: "1" } }),
  ["page-config"],
  { revalidate: 3600 }
);

// Cacheada 1 minuto (60s) con tag "products"
export const getCachedProducts = (page, limit, categoryId?, search?, subCategoryId?) =>
  unstable_cache(
    () => garmentService.getGarmentsPaginated(...),
    [`products-pg-${page}-lim-${limit}-cat-${catId}-q-${search}-sub-${subId}`],
    { revalidate: 60, tags: ["products"] }
  );

// Las demás son cacheadas 1 hora con sus respectivos tags
export const getCachedCategories = unstable_cache(fn, ["all-categories"], { revalidate: 3600, tags: ["categories"] });
export const getCachedProviders  = unstable_cache(fn, ["all-providers"],  { revalidate: 3600, tags: ["providers"] });
export const getCachedSizeTypes  = unstable_cache(fn, ["all-size-types"], { revalidate: 3600, tags: ["sizeTypes"] });
export const getCachedColors     = unstable_cache(fn, ["all-colors"],     { revalidate: 3600, tags: ["colors"] });
```

### Tags del servidor y quién los invalida

| Tag | revalidate | Lo invalida (`revalidateTag`) |
|---|---|---|
| `"products"` | 60s | `garments.ts`: createGarment, updateGarment, deleteGarment |
| `"products"` | 60s | `movements.ts`: createMovement (cambia stock) |
| `"categories"` | 3600s | `categories.ts`: create/update/delete category/subCategory |
| `"providers"` | 3600s | `providers.ts`: create/update/delete provider |
| `"sizeTypes"` | 3600s | `sizes.ts`: create/delete size/sizeType |
| `"colors"` | 3600s | `colors.ts`: createColor |
| `"branding-config"` | 3600s | Solo expira por tiempo (no hay `revalidateTag`) |
| `"page-config"` | 3600s | Solo expira por tiempo |

> **Regla:** Toda Server Action que mute datos debe llamar `revalidateTag("tag-correspondiente")` al final. Si falta, los datos cacheados no se actualizan hasta que expire el tiempo.

### Capa 2: TanStack Query (cliente, solo en /dashboard)

El dashboard admin usa **TanStack Query** para gestionar el estado del cliente con queries reactivas.

```typescript
// src/app/dashboard/layout.tsx
import QueryProvider from "@/providers/QueryProvider";
export default function DashboardLayout({ children }) {
  return <QueryProvider>{children}</QueryProvider>;
}

// src/providers/QueryProvider.tsx — configuración del cliente
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } }
});
```

### Query Keys del cliente y su relación con los hooks

| Hook | queryKey | staleTime | Fuente de datos |
|---|---|---|---|
| `useGarments` | `["garments", { page, limit, categoryId, search }]` | 60s (default) | `getGarments()` Server Action |
| `useCategories` | `["categories"]` | `Infinity` | `getCategories()` Server Action |
| `useSizeTypes` | `["sizeTypes"]` | `Infinity` | `getSizeTypes()` Server Action |
| `useProviders` | `["providers"]` | `Infinity` | `getProviders()` Server Action |
| `useColors` | `["colors"]` | `Infinity` | `getColors()` Server Action |

### Invalidación de caché del cliente (TanStack Query)

En `DashboardClient.tsx`, después de mutaciones:

```typescript
const queryClient = useQueryClient();

const invalidarProductos = () => {
  queryClient.invalidateQueries({ queryKey: ["garments"] });
};

// Se pasa como prop onSuccess a los modales
<MovementModal garments={garments} onSuccess={invalidarProductos} />
<ProductModal ... onSuccess={invalidarProductos} />
```

### Flujo completo de una mutación en el dashboard

```
Usuario edita producto
  → ProductModal.onSubmit()
    → updateGarment() [Server Action]
      → Valida con garmentSchema (Zod)
      → garmentService.updateGarmentWithDetails() [Prisma]
      → revalidateTag("products") [invalida caché servidor]
    → onSuccess?.() [callback del padre]
      → queryClient.invalidateQueries({ queryKey: ["garments"] }) [invalida caché cliente]
        → useGarments re-fetcha automáticamente
          → UI se actualiza
```

---

## Arquitectura en Capas

El proyecto sigue una arquitectura en 3 capas:

```
components/pages (UI)
    ↓ llaman
actions/ (Server Actions — interfaz pública)
    ↓ llaman
lib/services/ (Servicios — lógica de queries Prisma)
    ↓ usan
lib/prisma.ts (ORM — PrismaClient singleton)
    ↓
Base de datos (MySQL/MariaDB)
```

### Por qué la separación actions/ vs services/

- **`actions/`**: Validan con Zod, manejan errores, llaman `revalidateTag`, usan `auth()`. Son la interfaz pública que puede llamar cualquier componente.
- **`services/`**: Solo contienen las queries de Prisma, sin lógica de negocio. Son funciones puras que reciben parámetros tipados.

```typescript
// services/garment-service.ts — solo Prisma puro
export async function getGarmentsPaginated(page, limit, categoryId?, search?, subCategoryId?) {
  const where = { active: true, ...filtros };
  const [garments, total] = await Promise.all([
    prisma.garment.findMany({ where, include: {...}, skip, take }),
    prisma.garment.count({ where }),
  ]);
  return { garments, total };
}

// actions/garments.ts — orquesta el servicio
export async function getGarments(page, limit, categoryId?, search?) {
  const cachedFn = getCachedProducts(page, limit, categoryId, search);
  const { garments, total } = await cachedFn();
  return { success: true, data: serializeData(garments), total, totalPages };
}
```

---

## Base de Datos — Esquema Prisma Completo

### Configuración

```prisma
generator client {
  provider     = "prisma-client-js"
  output       = "../generated/prisma"  // Path personalizado
  relationMode = "prisma"               // Sin FK nativas en MySQL
}

datasource db {
  provider     = "mysql"
  relationMode = "prisma"               // Relaciones simuladas por Prisma
}
```

### Modelos

#### Autenticación

```prisma
model user {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?   // null en usuarios de Google
  role          user_role @default(USER)  // USER | ADMIN
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  emailVerified DateTime?
  image         String?
  telefono      String?
  account       account[]
}

model account {
  id                String  @id @default(cuid())
  userId            String
  provider          String  // "google"
  providerAccountId String
  // ...tokens OAuth
  @@unique([provider, providerAccountId])
  @@index([userId])
}
```

#### Catálogo

```prisma
model Category {
  id            String        @id @default(cuid())
  name          String        @unique
  active        Boolean       @default(true)
  subCategories SubCategory[]
  garments      Garment[]
}

model SubCategory {
  id          String    @id @default(cuid())
  name        String
  active      Boolean   @default(true)
  categoryId  String
  sizeTypeId  String?   // curva de talles opcional
  category    Category  @relation(...)
  sizeType    SizeType? @relation(...)
  garments    Garment[]
  @@unique([name, categoryId])
}

model Garment {
  id            String           @id @default(cuid())
  name          String
  description   String?          @db.Text
  price         Decimal          @db.Decimal(10, 2)  // precio de venta
  cost          Decimal          @db.Decimal(10, 2)  // precio de costo
  active        Boolean          @default(true)
  categoryId    String
  subCategoryId String?
  supplierId    String?
  variants      GarmentVariant[]
  images        GarmentImage[]
}

model GarmentVariant {
  id        String    @id @default(cuid())
  sku       String?   @unique
  stock     Int       @default(0)
  garmentId String
  sizeId    String?
  colorId   String?
  attributes Json?    // para talles custom: { customSize: "5'8 x 20 x 2" }
  movements  Movement[]
  @@unique([garmentId, sizeId, colorId])
}

model GarmentImage {
  id        String  @id @default(cuid())
  srcImage  String  @db.Text  // URL de Cloudinary
  alt       String?
  order     Int     @default(0)  // 0 = imagen principal
  garmentId String
  // onDelete: Cascade
}
```

#### Talles y Colores

```prisma
model SizeType {
  id    String  @id @default(cuid())
  name  String  @unique  // "Talles Adulto", "Medidas Tablas"
  sizes Size[]
  subCategories SubCategory[]
}

model Size {
  id         String  @id @default(cuid())
  value      String          // "XS", "M", "5'8"", "6'0""
  order      Int @default(0) // para ordenar correctamente
  active     Boolean @default(true)
  sizeTypeId String
  variants   GarmentVariant[]
  @@unique([value, sizeTypeId])
}

model Color {
  id       String  @id @default(cuid())
  name     String  @unique   // "Rojo", "Azul marino"
  hex      String?           // "#FF0000"
  active   Boolean @default(true)
  variants GarmentVariant[]
}
```

#### Proveedores y Movimientos

```prisma
model Provider {
  id        String            @id @default(cuid())
  name      String            @unique
  active    Boolean           @default(true)
  details   String?
  contacts  ContactProvider[]
  garments  Garment[]
}

model ContactProvider {
  id         String  @id @default(cuid())
  contact    String  // email o teléfono
  type       String  // "EMAIL" | "PHONE"
  idProvider String
  active     Boolean @default(true)
  @@unique([contact, idProvider])  // contact_provider_unique
}

model Movement {
  id             String    @id @default(cuid())
  type           MovementType  // IN | OUT
  quantity       Int
  priceAtTime    Decimal   @db.Decimal(10, 2)
  note           String?
  variantId      String
  createdAt      DateTime  @default(now())
}

enum MovementType { IN  OUT }
```

#### Configuración de Página

```prisma
model PageConfig {
  id        String  @id @default(cuid())
  // BRANDING
  storeName       String
  description     String? @db.Text
  slogan          String?
  logo            String? @db.Text   // URL Cloudinary
  favicon         String? @db.Text
  banner          String? @db.Text
  primaryColor    String? @default("#000000")
  secondaryColor  String? @default("#FFFFFF")
  // ECOMMERCE
  ecommerceEnabled Boolean @default(true)
  cartEnabled      Boolean @default(true)
  checkoutEnabled  Boolean @default(true)
  // CONTACTO
  phone    String?
  whatsapp String?
  email    String?
  // UBICACIÓN
  locationEnabled Boolean @default(false)
  address  String?
  city     String?
  province String?
  country  String?
  postalCode String?
  mapsUrl  String? @db.Text
  // REDES SOCIALES
  instagram String? @db.Text
  facebook  String? @db.Text
  tiktok    String? @db.Text
  x         String? @db.Text
  youtube   String? @db.Text
  linkedin  String? @db.Text
  // SISTEMA
  currency        String @default("ARS")
  language        String @default("es")
  maintenanceMode Boolean @default(false)
  // SEO
  metaTitle       String?
  metaDescription String? @db.Text
  // LEGAL
  termsAndConditions String? @db.Text
  privacyPolicy      String? @db.Text
}
```

> **IMPORTANTE:** `PageConfig` siempre tiene el registro con `id = 1` (string, no int). Todas las acciones hacen `{ where: { id: 1 } }`. La función `getOrCreatePageConfig()` en `shared/get-page-config.ts` garantiza que exista.

---

## Autenticación — Flujo Completo

### Archivos involucrados

| Archivo | Propósito |
|---|---|
| `src/auth.ts` | Config completa: providers Google + Credentials, callbacks JWT y session |
| `src/auth.config.ts` | Config edge-compatible (sin Node.js específico), para middleware |
| `src/middleware.ts` | Usa `authConfig` para proteger rutas sin importar prisma |
| `src/app/api/auth/[...nextauth]/route.ts` | Expone handlers GET/POST de Auth.js |

### Callbacks JWT y Session

```typescript
// auth.ts
callbacks: {
  async jwt({ token, user, trigger, session }) {
    if (user) {
      // Primera vez: poblar token desde el user de la DB
      token.id = user.id;
      token.role = user.role;
      token.telefono = user.telefono;
      token.image = user.image;
    }
    if (trigger === "update" && session) {
      // Cuando el usuario actualiza su perfil (useSession update)
      token.name = session.name ?? token.name;
      token.telefono = session.telefono ?? token.telefono;
    }
    return token;
  },
  async session({ session, token }) {
    if (!token.id) return { ...session, user: null }; // token inválido
    session.user.id = token.id;
    session.user.role = token.role;
    session.user.telefono = token.telefono;
    session.user.image = token.image;
    session.user.name = token.name;
    return session;
  }
}
```

### Protección de rutas (middleware.ts)

```typescript
const isApiAuthRoute   = pathname.startsWith("/api/auth");     // siempre pasar
const isAuthRoute      = ["/login", "/register"].includes(...); // redirigir si logueado
const isAdminRoute     = pathname.startsWith("/admin");
const isGestionRoute   = ["/dashboard", "/provider", "/sizes", "/movements"].includes(...);

// Reglas:
// 1. API auth → siempre pasa
// 2. Rutas de auth + logueado → redirige a "/"
// 3. Admin/gestión + no logueado → redirige a /login?callbackUrl=...
// 4. Admin/gestión + rol USER → redirige a "/"
```

### Configuración de sesión

```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60,    // 1 día
  updateAge: 60 * 60,       // refresca token cada 1 hora de actividad
}
```

---

## Gestión de Imágenes — Dos Caminos

### 1. Imágenes de productos (desde el cliente)

`src/components/products/forms/ImageUploader.tsx` → sube directamente a Cloudinary usando **upload preset público** (sin exponer API secret):

```typescript
const data = new FormData();
data.append("file", file);
data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
const res = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
  { method: "POST", body: data }
);
// Recibe: { secure_url, public_id }
// Carpeta: gestion-stock/garments/
```

### 2. Imágenes de branding (desde el servidor)

`src/actions/page-config/branding.actions.ts` + `src/lib/upload-image.ts` → usa las credenciales del servidor:

```typescript
// lib/upload-image.ts
export async function uploadImage({ base64, folder, publicId, displayName }) {
  return cloudinary.uploader.upload(base64, {
    folder,
    public_id: publicId,
    overwrite: true,
    format: "webp",           // convierte a webp automáticamente
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });
}

// Carpetas generadas con generateSeoImageData():
// gestion-stock/{slug-del-negocio}/branding/logo
// gestion-stock/{slug-del-negocio}/branding/banner
// gestion-stock/{slug-del-negocio}/branding/favicon
```

### Eliminar imágenes anteriores

Antes de subir una nueva imagen de branding, se elimina la anterior con `extractPublicId()`:

```typescript
const publicId = extractPublicId(imagenAnteriorUrl);
if (publicId) await cloudinary.uploader.destroy(publicId, { invalidate: true });
```

---

## Hooks Personalizados

Todos en `src/hooks/`. Usan TanStack Query y solo funcionan dentro de componentes envueltos con `QueryProvider` (es decir, dentro del layout del dashboard).

### useGarments

```typescript
export function useGarments(page, limit, categoryId?, search?) {
  return useQuery({
    queryKey: ["garments", { page, limit, categoryId, search }],
    queryFn: async () => {
      const res = await getGarments(page, limit, categoryId, search);
      if (res.error) throw new Error(res.error);
      return res; // { success, data, total, page, totalPages }
    },
    placeholderData: (prev) => prev, // mantiene datos previos al paginar (sin flash)
  });
}
```

### useCategories / useColors / useProviders / useSizeTypes

Todos siguen el mismo patrón con `staleTime: Infinity` porque los datos de referencia cambian poco:

```typescript
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await getCategories(); // Server Action cacheada
      if (!data) throw new Error("Error");
      return data;
    },
    staleTime: Infinity, // solo se refresca con queryClient.invalidateQueries
  });
}
```

### useProductForm

Hook especial que encapsula toda la lógica del formulario de producto:

```typescript
// Gestiona:
const { formData, isEdit, availableSubCategories, availableSizes,
        setField, handleCategoryChange, handleSubCategoryChange,
        addVariant, removeVariant, updateVariant, updateVariantCustomSize,
        addImages, removeImage, handleSubmit } = useProductForm({ garment, categories, sizes });

// availableSizes se calcula desde la subcategoría seleccionada:
// SubCategory → SizeType → Size[]
// Si no hay sizeType, devuelve []
// Si hay variante custom (sizeId === "CUSTOM"), guarda en attributes.customSize
```

---

## Componentes Clave

### ProductModal

`src/components/products/modals/ProductModal.tsx`

- Usa `createPortal(modal, document.body)` para evitar problemas de z-index
- Soporta crear y editar (detecta por prop `garment`)
- Delega toda la lógica a `useProductForm`
- Las imágenes se suben a Cloudinary al seleccionarlas (no al guardar)

### QuickViewTable

`src/components/products/modals/QuickViewTable.tsx`

- Tabla del inventario admin con acciones inline (editar, eliminar)
- Cada fila tiene `ProductModal` en modo edición y botón de eliminar
- La eliminación usa `ConfirmDialog` (diálogo de confirmación reutilizable)
- Muestra stock total de todas las variantes y el proveedor como botón que abre `ProviderModal`

### Hero

`src/components/layout/Hero.tsx`

- Carrusel automático con cambio cada 6 segundos
- El primer slide se construye dinámicamente desde `pageConfig` (storeName, slogan, banner, primaryColor)
- Los siguientes slides son estáticos desde `data.js`
- Usa `primaryColor` del pageConfig para el color del botón CTA y los indicadores

### AppGate

`src/components/layout/AppGate.tsx`

- Controla el flujo legal antes de mostrar la app
- Estado gestionado con `localStorage` (3 llaves: `cookiesAcknowledged`, `privacySeen`, `termsAccepted`)
- Flujo: CookieModal → PrivacyModal (auto, 1 segundo de delay) → TermsModal → App renderizada
- El Footer solo se renderiza cuando el usuario ha aceptado todo

---

## Paletas de Colores y Estilos

### CSS Variables Globales (`globals.css`)

```css
:root {
  --primary: 38 92% 50%;        /* amber para botones principales */
  --secondary: 0 0% 95%;
  --destructive: 0 70% 50%;
  --border: 0 0% 85%;
  --radius: 0.75rem;
}
.dark {
  --primary: 38 92% 55%;
  --background: 0 0% 6%;
  --card: 0 0% 10%;
}
```

### Panel Admin Inventario (Dashboard, Movements, Sizes, Provider, Categories)

```
Fondo: bg-black / bg-neutral-950 / bg-neutral-900
Texto: white / neutral-200 / neutral-400
Acento principal: amber-500 (#f59e0b)
Bordes activos: amber-500/50
Botones: variant="amarillo" → gradiente amber
Botones destructivos: variant="rojo" → gradiente rojo
```

### Tienda Pública y Catálogo (Productos, Categorías, Formularios)

```
#ffffff  — fondos principales (blanco)
#f0fafa  — fondos suaves (cyan muy claro)
#e0f5f5  — inputs, tags, variantes
#b2dede  — bordes
#4ab8b8  — cyan acento medio
#0d5c63  — verde marino oscuro (botones, iconos)
#083d42  — verde marino muy oscuro (títulos)
#0d2b2e  — texto principal
#4a7c80  — texto secundario
#e05050  — rojo de eliminación
```

### Panel de Configuración (`/admin/pageConfig`)

```
Fondo: bg-neutral-950 con bg-black/40
Bordes: border-neutral-900
Acento: cyan-500
Íconos de sección: text-cyan-400 en bg-cyan-500/10
Botones de acción: bg-cyan-500 text-black font-black uppercase
Inputs: bg-neutral-950 border-neutral-800, focus: border-cyan-500
```

---

## Validación con Zod — Esquemas Completos

Todos en `src/lib/zod.ts`:

```typescript
// AUTH
loginSchema       — email + password (min 6)
registerSchema    — extends login + name (solo letras/acentos/ñ) + telefono?

// PRODUCTOS
garmentSchema     — name, price, cost, description?, categoryId, subCategoryId?, supplierId?, images[], variants[]
variantSchema     — sizeId?, colorId, sku?, stock (no negativo), attributes?

// CATEGORÍAS
categorySchema    — name, description?, sizeTypeId?

// MOVIMIENTOS
movementSchema    — variantId, type (IN|OUT), quantity (entero positivo), note?

// PROVEEDORES
createProviderSchema — name, details?, contacts[] (mínimo 1)
updateProviderSchema — extends create + id (cuid)
contactSchema        — email válido O teléfono válido (regex)
providerNameSchema   — string 2-100 chars, solo letras y espacios
idSchema             — string cuid

// TALLES
SizeTypeNameSchema   — name (mismas reglas que providerName)
SizeValueSchema      — string min 1, sin espacios, solo: letras, números, puntos, guiones, slash, comillas

// COLORES
colorSchema          — name (min 1), hex? (formato #000 o #000000)

// PERFIL
changePasswordSchema — oldPassword?, newPassword (min 6), confirmPassword (deben coincidir)
updateProfileSchema  — name (min 2, solo letras), telefono?
```

---

## Convenciones y Reglas del Proyecto

### Código

- **Comentarios, variables, funciones y mensajes**: siempre en **español**
- **Nombres de archivos**: kebab-case para utilidades, PascalCase para componentes
- **Tipos TypeScript**: en inglés (convención de las librerías)
- **Never `any`**: usar tipos correctos; si no se puede, documentar por qué
- `"use server"` al principio de cada archivo de actions
- `"use client"` solo cuando es estrictamente necesario (estado, efectos, eventos)

### Server Actions

```typescript
export async function hacerAlgo(datos: unknown) {
  // 1. Validar
  const parsed = esquema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    // 2. Operar
    const resultado = await servicio.crear(parsed.data);
    // 3. Invalidar caché
    revalidateTag("tag-correspondiente");
    // 4. Retornar serializado
    return { success: true, data: serializeData(resultado) };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Ya existe un registro con esos datos" };
    if (error.code === "P2003") return { error: "No se puede eliminar: tiene registros vinculados" };
    return { error: "Error interno del servidor" };
  }
}
```

### Serialización

Prisma retorna `Decimal` (de `@db.Decimal`) que **no se puede serializar** entre Server y Client Components. **Siempre** usar `serializeData()` en las acciones:

```typescript
import { serializeData } from "@/lib/utils";

// serializeData usa JSON.parse(JSON.stringify(...)) con un replacer
// que detecta Decimal por su constructor y llama .toNumber()
return { success: true, data: serializeData(resultadoPrisma) };
```

### Imágenes en componentes

```typescript
// CORRECTO: next/image con fill o width/height
import Image from "next/image";
<Image src={url} alt={alt} fill className="object-cover" />

// INCORRECTO: <img> directa (no optimizado, puede usar para SVGs simples)
<img src={url} alt={alt} />
```

---

## Páginas y Renderizado

| Página | Tipo de renderizado | Notas |
|---|---|---|
| `/` | Server Component → Client | Carga branding desde servidor |
| `/login`, `/register` | Client Component | Solo cliente, sin datos del servidor |
| `/dashboard` | Client Component (TanStack Query) | Datos reactivos con paginación |
| `/categories` | Server Component + `force-dynamic` | Se revalida en cada request |
| `/provider` | Client Component + Suspense | Carga inicial en cliente |
| `/sizes` | Client Component | Estado local con `useState` |
| `/movements` | Server Component | Datos frescos en cada request |
| `/productos` | Server Component | Paginado, con searchParams |
| `/productos/[categoria]` | SSG + ISR | `generateStaticParams` + `revalidate` por tag |
| `/productos/item/[id]` | Server Component | Fetch por ID, con `notFound()` |
| `/escuela` | Server Component puro | Sin DB, solo JSX/HTML |
| `/personalizado` | Client Component puro | Sin DB, estado local + WhatsApp |
| `/admin/pageConfig` | Server Component + secciones Client | Lee config del servidor |

---

## Variables de Entorno

```env
# === BASE DE DATOS ===
DATABASE_URL="mysql://root@127.0.0.1:3306/gestion-stock"
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="gestion-stock"
DATABASE_HOST="127.0.0.1"  # IMPORTANTE: usar 127.0.0.1 no localhost (evita bug en Windows)
DATABASE_PORT=3306
TIMEZONE="America/Argentina/Buenos_Aires"

# === AUTH ===
AUTH_SECRET="secreto-seguro-min-32-chars"
AUTH_GOOGLE_ID="...apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-..."
AUTH_TRUST_HOST=true  # Necesario para deployments detrás de proxy

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME="nombre-de-tu-cloud"          # Solo servidor
CLOUDINARY_API_KEY="123456789012345"                  # Solo servidor
CLOUDINARY_API_SECRET="abc123..."                      # Solo servidor
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="nombre-de-tu-cloud" # Cliente y servidor
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="preset-unsigned" # Upload preset público (sin signed)
```

---

## Scripts y Comandos

```bash
# Desarrollo con Turbopack (más rápido)
npm run dev

# Build de producción (incluye: prisma generate + db push + next build)
npm run build

# Iniciar en producción
npm start

# Linting (eslint con config de Next.js)
npm run lint

# Prisma — comandos frecuentes
npx prisma generate              # Regenerar cliente (después de cambiar schema.prisma)
npx prisma db push               # Aplicar cambios al schema sin migrar (dev rápido)
npx prisma migrate dev           # Crear migración formal (con nombre)
npx prisma studio                # GUI visual para la base de datos
npx prisma db pull               # Importar schema desde DB existente
```

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|---|---|---|
| `Decimal` no serializable | Retornar Prisma Decimal a Client Component | Usar `serializeData()` |
| `Error P2002` | Unique constraint violada | Verificar campos únicos (SKU, email, etc.) |
| `Error P2003` | FK simulada violada | El registro referenciado no existe |
| `Error P2025` | Record not found | Verificar que el ID existe antes de update/delete |
| Imágenes no se cargan | `unoptimized: true` en next.config pero hostname no permitido | Agregar hostname en `remotePatterns` |
| Sesión null en server | Token JWT inválido o expirado | El callback session retorna `user: null`, verificar en el componente |
| Build falla en Vercel | DB no disponible en build time | El script build tiene fallback: `|| echo 'Database unreachable'` |
| Tipos Prisma no encontrados | Se movieron carpetas o falta `generate` | `npx prisma generate` después de `npm install` |
| HMR lento en dev | Turbopack activo | Normal, Turbopack es beta; desactivar con `next dev` sin `--turbopack` si hay problemas |

---

## Puntos a Tener en Cuenta

1. **CategoryModal vs ManageCategoryModal**: Son dos componentes distintos con la misma función pero diferente paleta. `CategoryModal` es el admin oscuro (amber). `ManageCategoryModal` es el de /categories (cyan). No mezclar.

2. **ProductLayout.jsx es legado**: Usa datos mock de `data.js` y `localStorage` directo. No agregar lógica nueva ahí. La tienda real usa Server Components.

3. **PageConfig id = 1**: Si se hace `prisma.pageConfig.findUnique({ where: { id: "1" } })` y no existe, algunas acciones fallan silenciosamente. Usar `getOrCreatePageConfig()` en casos críticos.

4. **Prisma output en generated/**: El import del cliente Prisma es `from '../../generated/prisma/client'` (relativo a `src/lib/`). Si se mueven archivos, actualizar.

5. **SSL automático en prisma.ts**: Si `DATABASE_HOST` es `localhost` o `127.0.0.1`, SSL se desactiva. En producción con host remoto, SSL activo automáticamente.

6. **`serializeData` es obligatorio**: Nunca retornar directamente el resultado de Prisma si tiene campos `price`, `cost`, `priceAtTime`, `descuento`, `senia` u otros Decimal.

7. **TanStack Query solo en /dashboard**: `QueryProvider` está solo en `dashboard/layout.tsx`. Los hooks `useGarments`, `useCategories`, etc. **solo funcionan ahí**. No usarlos en otras rutas sin añadir `QueryProvider`.