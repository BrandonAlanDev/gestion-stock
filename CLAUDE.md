# CLAUDE.md — GestionOK / NewSurfBoard

Documento de referencia completo del proyecto para uso de Claude.
Incluye arquitectura, convenciones, base de datos, problemas conocidos y guías de desarrollo.

---

## Descripción General

Sistema web full-stack de **gestión de stock e-commerce** construido sobre Next.js App Router.
El negocio detrás es **NewSurfBoard**, una tienda de surf ubicada en Mar del Plata, Argentina.

La plataforma tiene dos capas:
- **Panel de administración** (ADMIN): gestión de productos, categorías, talles, colores, proveedores, movimientos de stock y configuración de la página.
- **Tienda pública** (USER): catálogo de productos, carrito, páginas de categorías, escuela de surf, tabla personalizada.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15.2.8 (App Router, Turbopack en dev) |
| Lenguaje | TypeScript (strict mode) |
| Base de datos | MySQL / MariaDB |
| ORM | Prisma 7 con Driver Adapter nativo (`@prisma/adapter-mariadb`) |
| Autenticación | Auth.js v5 (NextAuth beta.30) — Google OAuth + Credenciales |
| Validación | Zod v4 |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion v12 |
| Imágenes cloud | Cloudinary v2 |
| Notificaciones | Sonner v2 |
| Componentes UI | Radix UI (primitivos) + componentes propios |
| Iconos | Lucide React |

---

## Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="mysql://root@127.0.0.1:3306/gestion-stock"
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="gestion-stock"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306
TIMEZONE="America/Argentina/Buenos_Aires"

# Auth
AUTH_SECRET="secreto-generado"
AUTH_GOOGLE_ID="google-client-id"
AUTH_GOOGLE_SECRET="google-client-secret"
AUTH_TRUST_HOST=true

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="nombre-cloud"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="preset-publico"
CLOUDINARY_API_KEY="api-key"
CLOUDINARY_API_SECRET="api-secret"
```

> **Importante:** Usar `127.0.0.1` en lugar de `localhost` para evitar problemas de conexión en Windows/Node.js.

---

## Comandos Principales

```bash
# Desarrollo (con Turbopack)
npm run dev

# Build (genera Prisma + push DB + build Next)
npm run build

# Inicializar base de datos
npx prisma db push
npx prisma generate

# Linting
npm run lint
```

---

## Estructura del Proyecto

```
src/
├── actions/                  # Server Actions (lógica backend)
│   ├── admin.actions.ts      # Gestión de turnos (admin)
│   ├── admin-dashboard.ts    # Usuarios: listar, cambiar rol, eliminar
│   ├── auth-actions.ts       # Login, registro, logout
│   ├── colors.ts             # CRUD colores
│   ├── garments.ts           # CRUD productos, categorías, subcategorías, proveedores
│   ├── movements.ts          # Movimientos de stock (ingreso/egreso)
│   ├── providers.ts          # CRUD proveedores (con Zod)
│   ├── sizes.ts              # CRUD tipos de talle y valores
│   ├── user-dashboard.ts     # Perfil, turnos, contraseña del usuario
│   └── page-config/          # Configuración de la página pública
│       ├── branding.actions.ts
│       ├── contact.actions.ts
│       ├── ecommerce.actions.ts
│       ├── general.actions.ts
│       ├── location.actions.ts
│       ├── maintenance.actions.ts
│       ├── seo.actions.ts
│       ├── socials.actions.ts
│       └── shared/
│           ├── defaults.ts
│           ├── get-page-config.ts
│           ├── reset-data.ts
│           ├── types.ts
│           └── upload-page-image.ts
│
├── app/                      # Rutas (App Router)
│   ├── layout.tsx            # Layout raíz (fetches session + branding + pageConfig)
│   ├── page.tsx              # Home → HomeClient → ProductLayout
│   ├── loading.tsx           # Loading global
│   ├── api/auth/[...nextauth]/route.ts
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx    # Panel inventario (solo ADMIN)
│   ├── categories/page.tsx   # Gestión categorías (solo ADMIN)
│   ├── sizes/page.tsx        # Gestión talles (solo ADMIN)
│   ├── provider/page.tsx     # Gestión proveedores (solo ADMIN)
│   ├── movements/page.tsx    # Historial movimientos (solo ADMIN)
│   ├── admin/pageConfig/page.tsx  # Configuración página pública (solo ADMIN)
│   ├── productos/
│   │   ├── page.tsx          # Catálogo completo
│   │   ├── item/[id]/page.tsx  # Vista producto individual
│   │   └── [categoria]/page.tsx  # Vista por categoría (rutas estáticas)
│   ├── escuela/page.tsx      # Landing escuela de surf
│   └── personalizado/page.tsx  # Diseñador de tablas custom
│
├── components/
│   ├── admin/page-config/    # Secciones del panel de configuración
│   │   ├── BrandingSection.tsx
│   │   ├── ContactSection.ts
│   │   ├── EcommerceSection.tsx
│   │   ├── LocationSection.tsx
│   │   ├── PageConfigForm.tsx
│   │   ├── SeoSection.tsx
│   │   ├── SocialsSection.tsx
│   │   └── shared/
│   │       ├── ImageUploader.tsx
│   │       ├── Input.tsx
│   │       ├── SwitchCard.tsx
│   │       └── Textarea.tsx
│   ├── auth/
│   │   ├── AuthLayout.tsx
│   │   ├── google-button.tsx
│   │   └── LoginModal.tsx
│   ├── cart/
│   │   └── CartSidebar.tsx
│   ├── categories/
│   │   ├── filters/CategoryFilter.tsx
│   │   ├── forms/AddSubCategoryForm.tsx
│   │   ├── modals/
│   │   │   ├── CategoryModal.tsx
│   │   │   ├── DeleteSubBtn.tsx
│   │   │   └── ManageCategoryModal.tsx
│   │   └── view/CategoryContentClient.tsx
│   ├── data/
│   │   └── data.js           # Datos estáticos: heroSlides, products mock, categories mock
│   ├── home/
│   │   ├── HomeClient.tsx
│   │   └── HomeSections.jsx  # Grid de categorías con animaciones
│   ├── layout/
│   │   ├── AppGate.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx    
│   │   ├── Hero.tsx          # Carrusel hero con slides dinámicos
│   │   ├── LayoutComponent.tsx
│   │   └── RouteLoader.tsx 
│   ├── legal/
│   │   ├── CookieModal.tsx
│   │   ├── PrivacyModal.tsx
│   │   └── TermsModal.tsx
│   ├── movements/
│   │   └── MovementModal.tsx
│   ├── products/
│   │   ├── cards/ProductCard.tsx
│   │   ├── grid/ProductGrid.tsx
│   │   ├── layouts/ProductLayout.jsx
│   │   ├── modals/
│   │   │   ├── ProductModal.tsx
│   │   │   └── QuickViewTable.tsx
│   │   └── views/
│   │       ├── CatalogoClient.tsx
│   │       ├── ProductoView.tsx
│   │       └── ProductsPage.tsx
│   ├── providers/
│   │   ├── PageConfigProvider.tsx  # Context para pageConfig global
│   │   └── SessionWrapper.tsx
│   ├── search/
│   │   └── Search.tsx        # Búsqueda con debounce y URL params
│   └── ui/
│       ├── button.tsx        # Button con variantes (CVA)
│       └── input.tsx         # Input base (Radix style)
│
├── context/
│   └── CartContext.tsx       # Estado global del carrito (localStorage)
│
├── lib/
│   ├── cloudinary.ts         # Config Cloudinary + extractPublicId()
│   ├── prisma.ts             # Singleton PrismaClient con adapter MariaDB
│   ├── upload-image.ts       # Helper para subir imágenes a Cloudinary
│   ├── utils.ts              # cn() + serializeData() (Decimal → Number)
│   └── zod.ts                # Todos los schemas de validación
│
├── types/
│   └── next-auth.d.ts        # Extensión de tipos de sesión
│
├── auth.ts                   # Configuración Auth.js (providers, callbacks JWT/session)
├── auth.config.ts            # Config base de Auth (sin providers, para middleware)
└── middleware.ts             # Protección de rutas por rol

generated/
└── prisma/                   # Cliente Prisma generado (no editar manualmente)

prisma/
├── schema.prisma
└── migrations/
    └── 0_init/migration.sql
```

---

## Esquema de Base de Datos (Prisma)

### Modelos de Autenticación
```
account      — Cuentas OAuth vinculadas a usuarios
user         — Usuarios del sistema (rol: USER | ADMIN)
```

### Modelos de Catálogo
```
Category        — Categoría principal (ej: Tablas, Trajes)
SubCategory     — Subcategoría vinculada a Category y opcionalmente a SizeType
Garment         — Producto principal con precio, costo, descripción
GarmentVariant  — Variante de producto (talle + color + stock + SKU)
GarmentImage    — Imágenes del producto (hasta 4, con orden)
```

### Modelos de Talles y Colores
```
SizeType     — Grupo de talles (ej: "Talles Adultos", "Talles Tablas")
Size         — Valor de talle (ej: S, M, L, 5'6", 6'0") con orden
Color        — Color con nombre y código hex
```

### Modelos de Negocio
```
Provider         — Proveedor/marca
ContactProvider  — Contactos del proveedor (email o teléfono)
Movement         — Registro de ingreso/egreso de stock
```

### Configuración de Página
```
PageConfig   — Registro único (id="1") con toda la configuración pública:
               storeName, slogan, description, logo, banner, favicon,
               primaryColor, secondaryColor, ecommerceEnabled, cartEnabled,
               checkoutEnabled, phone, whatsapp, email, locationEnabled,
               address, city, province, country, postalCode, mapsUrl,
               instagram, facebook, tiktok, x, youtube, linkedin,
               currency, language, maintenanceMode, metaTitle,
               metaDescription, termsAndConditions, privacyPolicy
```

> **Nota:** `PageConfig` usa `id: 1` (string "1") en todas las queries, aunque el schema define `@default(cuid())`. Esto es intencional para tener un único registro de configuración.

---

## Autenticación y Autorización

### Roles
- `USER` — acceso a tienda pública, perfil personal
- `ADMIN` — acceso a panel de gestión, configuración, usuarios

### Rutas Protegidas (middleware.ts)
```
/admin/*        → requiere ADMIN
/dashboard      → requiere ADMIN
/provider       → requiere ADMIN
/sizes          → requiere ADMIN
/movements      → requiere ADMIN
/login          → redirige a "/" si ya está logueado
/register       → redirige a "/" si ya está logueado
```

### Flujo de Sesión
- JWT strategy (24hs de duración, refresca cada hora con actividad)
- El token incluye: `id`, `role`, `telefono`, `image`
- En cada request, el callback `jwt` consulta la DB para obtener datos frescos del usuario
- `session.user` incluye: `id`, `role`, `telefono`, `image`, `name`, `email`

---

## Patrones de Código

### Server Actions
Todos los archivos en `src/actions/` usan `"use server"` y siguen este patrón:

```ts
export async function crearAlgo(datos: unknown) {
  // 1. Validar con Zod
  const parsed = schema.safeParse(datos);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    // 2. Operación DB
    const resultado = await prisma.modelo.create({ data: parsed.data });
    
    // 3. Revalidar caché
    revalidatePath("/ruta-afectada");
    
    return { success: true, data: serializeData(resultado) };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Registro duplicado" };
    return { error: "Error interno" };
  }
}
```

### Serialización de Datos Prisma
Prisma retorna campos `Decimal` que no son serializables por Next.js.
Usar siempre `serializeData()` de `@/lib/utils` antes de retornar datos al cliente:

```ts
import { serializeData } from "@/lib/utils";
return serializeData(resultadoPrisma);
```

### Convención de Nombres
- **Variables y comentarios en español** (preferencia del usuario)
- **Archivos y rutas** en inglés (convención Next.js)
- **Clases CSS** con Tailwind, estilos inline para paletas específicas

### Paleta de Colores del Panel Admin (blanco/cyan)
```
#ffffff   — blanco, fondos principales
#f0fafa   — cyan muy claro, fondos suaves
#e0f5f5   — cyan claro, inputs, variantes
#b2dede   — cyan borde
#4ab8b8   — cyan acento
#0d5c63   — verde marino, detalles, iconos
#083d42   — verde marino oscuro, títulos
#0d2b2e   — texto principal
#4a7c80   — texto secundario
```

### Paleta de Colores del Panel Admin (oscuro/negro)
```
#000000 / neutral-950  — fondos
amber-500 (#f59e0b)    — acento principal del panel oscuro
```

---

## Configuración de Cloudinary

Las imágenes se suben a Cloudinary en dos momentos:
1. **Frontend** (ProductModal.tsx): subida directa al crear/editar producto usando upload preset público
2. **Backend** (branding.actions.ts, garments.ts): subida desde Server Action con API secret

```ts
// Helper reutilizable
uploadImage({
  base64: "data:image/...",
  folder: "gestion-stock/nombre/branding/logo",
  publicId: "nombre-logo",
  displayName: "nombre-logo",
})
```

---

## Contextos y Providers Globales

### PageConfigProvider
Provee la configuración de la página pública a todos los Client Components.
Se inicializa en `layout.tsx` y se accede con `usePageConfig()`.

```tsx
const pageConfig = usePageConfig();
// pageConfig.pageConfig.storeName
// pageConfig.pageConfig.logo
// pageConfig.pageConfig.primaryColor
```

### CartContext
Estado global del carrito de compras. Persiste en `localStorage` bajo la clave `tech_cart`.

```tsx
const { cartItems, addToCart, updateQty, removeItem, cartCount, openCart } = useCart();
```

---

## Flujo de Modales Legales (AppGate)

Al primera visita, el usuario debe completar 3 pasos en orden:
1. **CookieModal** → guarda `cookiesAcknowledged` en localStorage
2. **PrivacyModal** → guarda `privacySeen` en localStorage  
3. **TermsModal** → guarda `termsAccepted` en localStorage

Hasta que `acceptedCookies && acceptedTerms` sean `true`, el contenido de la app **no se renderiza**.

---


## Páginas con Queries Pesadas (a optimizar)

### `/productos/[categoria]`
```ts
// Trae todos los productos de una categoría con variantes, imágenes y subcategorías
const category = await prisma.category.findFirst({
  include: {
    subCategories: { ... },
    garments: {
      include: {
        images: { ... },
        variants: { include: { size: true, color: true } },
        subCategory: true,
      },
    },
  },
});
```

### `/dashboard`
```ts
// 5 queries en paralelo (correcto con Promise.all)
const [garments, sizeTypes, categories, providers, colors] = await Promise.all([...]);
```

---

## Configuración de Next.js Importante

```ts
// next.config.ts
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },      // ← ESLint ignorado en build
  typescript: { ignoreBuildErrors: true },   // ← TypeScript ignorado en build
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    unoptimized: true,  // ← Optimización de imágenes desactivada
  },
};
```

> **Atención:** `ignoreBuildErrors: true` significa que errores de TypeScript no bloquean el build. Hay que verificar manualmente con `tsc`.

---

## Scripts de Build

```json
"build": "prisma generate && (prisma db push --accept-data-loss || echo 'Database unreachable') && next build"
```

El build intenta sincronizar la DB. Si la DB no está disponible (ej: Vercel sin DB en build), continúa igual.

---

## Generador de Prisma (Ruta Personalizada)

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"  // ← ruta no estándar
}
```

Por eso el import es:
```ts
import { PrismaClient } from '../../generated/prisma/client';
```

Si se mueven carpetas, eliminar `node_modules`, `.next`, `package-lock.json` y correr `npm install` + `npx prisma generate`.

---

## Rutas Estáticas Generadas

La página de categorías genera rutas estáticas en build:

```ts
// src/app/productos/[categoria]/page.tsx
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { name: true },
  });
  return categories.map((c) => ({
    categoria: c.name.toLowerCase(),
  }));
}
```

---

## Páginas Externas / Landing Pages

### `/escuela`
Landing de la escuela de surf. Componente Server Component puro, sin conexión a base de datos.
Usa un número de WhatsApp hardcodeado: `const WHATSAPP_NUMBER = ""` (vacío, pendiente de configurar).

### `/personalizado`
Diseñador interactivo de tablas de surf. Client Component con estado local.
También usa un número de WhatsApp hardcodeado: `const WA_NUMBER = "5492235000000"` (placeholder).

---

## Notas para el Desarrollo

1. **Comentarios y variables en español** — preferencia explícita del usuario.
2. **No usar `localStorage` fuera de `useEffect`** — causa errores de hidratación en SSR.
3. **Siempre usar `serializeData()`** al retornar datos con campos `Decimal` de Prisma.
4. **Los Server Actions devuelven `{ success, data }` o `{ error }`** — nunca lanzan excepciones al cliente.
5. **`data.js`** contiene datos mock de productos y slides — el catálogo real viene de la DB.
6. **El carrito** usa `id` numérico internamente pero los productos de la DB usan `id` string (cuid). Existe un mismatch de tipos en `CartContext.tsx`.