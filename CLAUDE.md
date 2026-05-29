# CLAUDE.md — Guía del Proyecto GestionOK / NewSurfBoard

Este archivo describe la arquitectura, convenciones y patrones del proyecto. Leerlo completo antes de realizar cualquier modificación.

---

## Descripción General

Sistema de gestión de stock e e-commerce construido con **Next.js 15** (App Router), **Prisma 7** y **MySQL/MariaDB**. El proyecto tiene dos caras principales:

- **Panel de administración**: gestión de productos, categorías, proveedores, talles, movimientos de stock y configuración visual del sitio.
- **Tienda pública (NewSurfBoard)**: catálogo de productos, carrito, páginas de categorías, escuela de surf, diseñador de tablas personalizado.

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 15.2.8 | Framework principal (App Router + Server Actions) |
| React | 19 | UI |
| TypeScript | 5 | Tipado estático |
| Prisma | 7.2+ | ORM con Driver Adapter para MariaDB |
| MySQL / MariaDB | — | Base de datos |
| Auth.js (NextAuth) | 5 beta | Autenticación (Credentials + Google OAuth) |
| Tailwind CSS | 4 | Estilos (con `@tailwindcss/postcss`) |
| Zod | 4 | Validación de esquemas |
| Cloudinary | 2 | Almacenamiento de imágenes |
| Sonner | 2 | Notificaciones toast |
| Framer Motion | 12 | Animaciones |
| Lucide React | 0.562 | Iconos |
| bcryptjs | 3 | Hash de contraseñas |
| slugify | 1.6 | Generación de slugs para SEO |
| use-debounce | 10 | Debounce en búsquedas |
| date-fns | 4 | Manejo de fechas |

---

## Estructura de Archivos

```
/
├── prisma/
│   ├── schema.prisma              # Modelos de base de datos
│   ├── config.ts                  # Configuración Prisma
│   └── migrations/
│       └── 0_init/migration.sql   # Migración inicial
│
├── src/
│   ├── app/                       # Rutas Next.js (App Router)
│   │   ├── layout.tsx             # Layout raíz (providers, header, footer)
│   │   ├── page.tsx               # Página de inicio (HomeClient)
│   │   ├── loading.tsx            # Spinner global
│   │   ├── globals.css            # Estilos globales + variables CSS
│   │   ├── login/page.tsx         # Inicio de sesión
│   │   ├── register/page.tsx      # Registro de usuario
│   │   ├── dashboard/page.tsx     # Panel admin — Inventario
│   │   ├── categories/page.tsx    # Panel admin — Categorías
│   │   ├── provider/page.tsx      # Panel admin — Proveedores
│   │   ├── sizes/page.tsx         # Panel admin — Talles
│   │   ├── movements/page.tsx     # Panel admin — Historial de movimientos
│   │   ├── productos/
│   │   │   ├── page.tsx           # Catálogo general
│   │   │   ├── [categoria]/       # Catálogo por categoría (rutas estáticas)
│   │   │   │   └── page.tsx
│   │   │   └── item/[id]/         # Detalle de producto
│   │   │       └── page.tsx
│   │   ├── personalizado/page.tsx # Diseñador de tablas custom
│   │   ├── escuela/page.tsx       # Página escuela de surf
│   │   └── admin/
│   │       └── pageConfig/page.tsx # Configuración visual del sitio
│   │
│   ├── actions/                   # Server Actions (toda la lógica de negocio)
│   │   ├── admin.actions.ts       # Turnos (obtener, limpiar)
│   │   ├── admin-dashboard.ts     # Gestión de usuarios (rol, eliminar)
│   │   ├── auth-actions.ts        # Login, registro, Google, logout
│   │   ├── colors.ts              # CRUD colores
│   │   ├── garments.ts            # CRUD productos, categorías, subcategorías, proveedores
│   │   ├── movements.ts           # Crear/obtener movimientos de stock
│   │   ├── providers.ts           # CRUD proveedores (con validación Zod)
│   │   ├── sizes.ts               # CRUD grupos de talles y valores
│   │   ├── user-dashboard.ts      # Perfil usuario, turnos, cambio de contraseña
│   │   └── page-config/           # Configuración de la página (branding, SEO, etc.)
│   │       ├── branding.actions.ts
│   │       ├── contact.actions.ts
│   │       ├── ecommerce.actions.ts
│   │       ├── general.actions.ts
│   │       ├── helpers.ts
│   │       ├── location.actions.ts
│   │       ├── maintenance.actions.ts
│   │       ├── seo.actions.ts
│   │       ├── socials.actions.ts
│   │       └── shared/
│   │           ├── defaults.ts    # Valores por defecto de PageConfig
│   │           ├── get-page-config.ts
│   │           ├── reset-data.ts  # Datos para reset de configuración
│   │           ├── types.ts       # Tipos TypeScript para PageConfig
│   │           └── upload-page-image.ts
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   └── page-config/       # Secciones del panel de configuración visual
│   │   │       ├── BrandingSection.tsx    # Logo, nombre, colores, banner
│   │   │       ├── ContactSection.tsx     # Subidor de imágenes (mal nombrado)
│   │   │       ├── EcommerceSection.tsx   # Switches ecommerce/carrito/checkout
│   │   │       ├── LocationSection.tsx    # Dirección, ciudad, provincia, país
│   │   │       ├── PageConfigForm.tsx     # Contenedor de todas las secciones
│   │   │       ├── SeoSection.tsx         # Meta title y descripción
│   │   │       ├── SocialsSection.tsx     # Redes sociales
│   │   │       └── shared/
│   │   │           ├── Input.tsx          # Input estilizado para el admin
│   │   │           ├── ImageUploader.tsx  # (contiene SwitchCard, nombre incorrecto)
│   │   │           ├── SwitchCard.tsx     # Toggle switch con card
│   │   │           └── Textarea.tsx       # Textarea estilizado para el admin
│   │   │
│   │   ├── auth/
│   │   │   ├── AuthLayout.tsx     # Layout para páginas de auth (fondo blur)
│   │   │   ├── google-button.tsx  # Botón Google OAuth
│   │   │   └── LoginModal.tsx     # Modal de login (usado en header)
│   │   │
│   │   ├── cart/
│   │   │   └── CartSidebar.tsx    # Panel lateral del carrito de compras
│   │   │
│   │   ├── categories/
│   │   │   ├── filters/
│   │   │   │   └── CategoryFilter.tsx    # Select de filtro por categoría
│   │   │   ├── forms/
│   │   │   │   └── AddSubCategoryForm.tsx # Formulario para añadir subcategoría
│   │   │   ├── modals/
│   │   │   │   ├── CategoryModal.tsx     # Modal alternativo (panel admin oscuro)
│   │   │   │   ├── DeleteSubBtn.tsx      # Botón eliminar subcategoría
│   │   │   │   └── ManageCategoryModal.tsx # Modal de gestión (paleta cyan)
│   │   │   └── view/
│   │   │       └── CategoryContentClient.tsx # Vista de categoría con filtro de subs
│   │   │
│   │   ├── data/
│   │   │   └── data.js            # Datos estáticos: categorías mock, heroSlides
│   │   │
│   │   ├── home/
│   │   │   ├── HomeClient.tsx     # Wrapper cliente para la página de inicio
│   │   │   └── HomeSections.jsx   # Grid de categorías (FeaturedSection)
│   │   │
│   │   ├── layout/
│   │   │   ├── AppGate.tsx        # Control de cookies, privacidad y términos
│   │   │   ├── Footer.tsx         # Footer del sitio público
│   │   │   ├── Header.tsx         # Navbar principal (fijo, con menú hamburguesa)
│   │   │   ├── Hero.tsx           # Slider hero con slides dinámicos
│   │   │   ├── LayoutComponent.tsx # Provider de carrito + header + footer
│   │   │   ├── Navbar.jsx         # Navbar vacío (componente legado, no usar)
│   │   │   └── RouteLoader.tsx    # Barra de progreso en cambios de ruta
│   │   │
│   │   ├── legal/
│   │   │   ├── CookieModal.tsx    # Modal de cookies (bloquea la app)
│   │   │   ├── PrivacyModal.tsx   # Modal de política de privacidad
│   │   │   └── TermsModal.tsx     # Modal de términos (requiere checkbox)
│   │   │
│   │   ├── movements/
│   │   │   └── MovementModal.tsx  # Modal para registrar ingresos/egresos de stock
│   │   │
│   │   ├── products/
│   │   │   ├── cards/
│   │   │   │   └── ProductCard.tsx   # Tarjeta de producto (hover con slider imágenes)
│   │   │   ├── grid/
│   │   │   │   └── ProductGrid.tsx   # Grilla de productos + modal de detalle
│   │   │   ├── layouts/
│   │   │   │   └── ProductLayout.jsx # Layout principal de la tienda (legado)
│   │   │   ├── modals/
│   │   │   │   ├── ProductModal.tsx  # Modal crear/editar producto (con portal)
│   │   │   │   └── QuickViewTable.tsx # Tabla de inventario admin con acciones
│   │   │   └── views/
│   │   │       ├── CatalogoClient.tsx  # Wrapper cliente para catálogo
│   │   │       ├── ProductoView.tsx    # Vista detalle de producto (variantes, talles)
│   │   │       └── ProductsPage.tsx    # Página catálogo con filtros y ordenamiento
│   │   │
│   │   ├── providers/
│   │   │   ├── PageConfigProvider.tsx  # Context para la configuración del sitio
│   │   │   └── SessionWrapper.tsx      # SessionProvider de NextAuth
│   │   │
│   │   ├── search/
│   │   │   └── Search.tsx         # Input de búsqueda con debounce (URL params)
│   │   │
│   │   └── ui/
│   │       ├── button.tsx         # Botón base con variantes (CVA)
│   │       └── input.tsx          # Input base de shadcn/ui
│   │
│   ├── context/
│   │   └── CartContext.tsx        # Context del carrito (con localStorage)
│   │
│   ├── lib/
│   │   ├── cloudinary.ts          # Configuración Cloudinary + extractPublicId()
│   │   ├── prisma.ts              # Singleton de PrismaClient con MariaDB adapter
│   │   ├── upload-image.ts        # Función para subir imagen a Cloudinary
│   │   ├── utils.ts               # cn() para clases + serializeData()
│   │   └── zod.ts                 # Todos los esquemas de validación Zod
│   │
│   ├── types/
│   │   └── next-auth.d.ts         # Extensión de tipos de NextAuth (id, role, telefono)
│   │
│   ├── auth.ts                    # Configuración principal de Auth.js
│   ├── auth.config.ts             # Config edge-compatible de Auth.js
│   └── middleware.ts              # Protección de rutas (admin, gestion, auth)
│
├── next.config.ts                 # Configuración Next.js
├── postcss.config.mjs             # Plugin Tailwind v4
├── tsconfig.json                  # Configuración TypeScript
├── prisma.config.ts               # Config Prisma con env vars
└── eslint.config.mjs              # ESLint flat config
```

---

## Base de Datos — Modelos Prisma

El esquema está en `prisma/schema.prisma`. Usa MySQL con `relationMode = "prisma"` (sin foreign keys nativas).

### Modelos Principales

| Modelo | Descripción |
|---|---|
| `user` | Usuarios del sistema (rol USER/ADMIN) |
| `account` | Cuentas OAuth (Google) vinculadas al user |
| `Category` | Categorías de productos (Tablas, Wetsuits, etc.) |
| `SubCategory` | Subcategorías con curva de talles opcional |
| `Garment` | Productos del catálogo |
| `GarmentVariant` | Variantes de producto (talle + color + stock + SKU) |
| `GarmentImage` | Imágenes de productos (hasta 4, con orden) |
| `SizeType` | Grupo de talles (Adulto, Junior, etc.) |
| `Size` | Valor de talle individual (XS, S, M... o medidas custom) |
| `Color` | Colores con nombre y hex |
| `Provider` | Proveedores de productos |
| `ContactProvider` | Contactos de proveedor (email o teléfono) |
| `Movement` | Registro de movimientos de stock (IN/OUT) |
| `PageConfig` | Configuración completa del sitio (id siempre = 1) |

### Relaciones Clave

```
Category → SubCategory (1:N) → SizeType (N:1)
Category → Garment (1:N)
Garment → GarmentVariant (1:N) → Size, Color
Garment → GarmentImage (1:N)
Garment → Provider (N:1)
GarmentVariant → Movement (1:N)
user → account (1:N)
```

### Regla importante: PageConfig

El registro de `PageConfig` siempre tiene `id = 1`. Todas las acciones de configuración hacen `update({ where: { id: 1 } })`. No crear registros nuevos de PageConfig manualmente.

---

## Configuración de Prisma

El proyecto usa **Prisma 7** con el **Driver Adapter nativo para MariaDB** (`@prisma/adapter-mariadb`). El cliente se genera en `generated/prisma/`, no en el default.

```ts
// src/lib/prisma.ts — patrón singleton
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

const adaptador = new PrismaMariaDb({ host, user, password, database, ssl });
export const prisma = global.prisma || new PrismaClient({ adapter: adaptador });
```

**Comandos importantes:**
```bash
npx prisma generate     # Regenerar cliente (después de cambiar schema)
npx prisma db push      # Aplicar cambios al schema sin migración
npx prisma migrate dev  # Crear migración (desarrollo)
```

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

# Auth
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_TRUST_HOST=true

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."

# Timezone
TIMEZONE="America/Argentina/Buenos_Aires"
```

---

## Autenticación

Gestionada con **Auth.js v5 (beta)**. Archivos relevantes:

- `src/auth.ts` — Providers (Google + Credentials), callbacks JWT/session, refresco desde DB
- `src/auth.config.ts` — Config edge-compatible (usada en middleware)
- `src/middleware.ts` — Protección de rutas
- `src/app/api/auth/[...nextauth]/route.ts` — Handler de Auth.js

### Roles

```typescript
enum user_role { USER | ADMIN }
```

### Protección de rutas (middleware.ts)

| Tipo de ruta | Condición |
|---|---|
| `/login`, `/register` | Redirige a `/` si ya está autenticado |
| `/admin/*`, `/dashboard`, `/provider`, `/sizes`, `/movements` | Requiere autenticación + rol ADMIN |
| Rutas públicas | Sin restricción |

### Token JWT

El token incluye: `id`, `role`, `telefono`, `image`, `name`. El callback `jwt` refresca desde la DB en cada petición si el user está logueado.

---

## Server Actions

Toda la lógica de negocio vive en `src/actions/`. Convenciones:

1. **Siempre** empezar con `"use server"` al tope del archivo.
2. Validar con **Zod** antes de cualquier operación de base de datos.
3. Llamar a `revalidatePath()` después de mutaciones para invalidar caché.
4. Retornar `{ success: true, data }` o `{ error: "mensaje" }` consistentemente.
5. Serializar datos con `serializeData()` antes de retornar (convierte `Decimal` a `number`).

```typescript
// Patrón típico de server action
export async function crearAlgo(data: unknown) {
  const parsed = esquemaZod.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const resultado = await prisma.modelo.create({ data: parsed.data });
    revalidatePath("/ruta");
    return { success: true, data: serializeData(resultado) };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Duplicado" };
    return { error: "Error interno" };
  }
}
```

### Errores Prisma frecuentes

| Código | Causa |
|---|---|
| `P2002` | Violación de UNIQUE constraint |
| `P2003` | Violación de referencia (FK simulada) |
| `P2025` | Registro no encontrado |

---

## Validación con Zod

Todos los esquemas están centralizados en `src/lib/zod.ts`. Esquemas principales:

| Esquema | Uso |
|---|---|
| `loginSchema` | Email + contraseña |
| `registerSchema` | Login + nombre + teléfono |
| `garmentSchema` | Crear/actualizar producto con variantes |
| `categorySchema` | Crear/actualizar categoría |
| `movementSchema` | Registrar movimiento de stock |
| `variantSchema` | Variante de producto individual |
| `createProviderSchema` | Crear proveedor con contactos |
| `updateProviderSchema` | Actualizar proveedor |
| `colorSchema` | Crear color |
| `SizeTypeNameSchema` | Nombre de grupo de talles |
| `SizeValueSchema` | Valor de talle (sin espacios) |

---

## Gestión de Imágenes

Las imágenes se suben a **Cloudinary** desde dos puntos:

### 1. Desde el frontend (ProductModal)
El componente sube directamente a Cloudinary usando el upload preset público:
```typescript
const data = new FormData();
data.append("file", file);
data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, ...);
```

### 2. Desde el servidor (BrandingSection, updateGarment)
Se usa la función `uploadImage()` de `src/lib/upload-image.ts` con las credenciales del servidor.

### Extracción de publicId
La función `extractPublicId(url)` en `src/lib/cloudinary.ts` extrae el ID público para poder eliminar imágenes:
```typescript
export function extractPublicId(url: string) {
  const parts = url.split("/upload/")[1];
  const clean = parts.replace(/v\d+\//, "");
  return clean.replace(/\.[^/.]+$/, "");
}
```

---

## Sistema de Configuración del Sitio (PageConfig)

El modelo `PageConfig` (id = 1) centraliza toda la configuración visual y funcional del sitio. Se accede mediante el contexto `PageConfigProvider`.

### Secciones configurables

| Sección | Campos |
|---|---|
| Branding | `storeName`, `slogan`, `description`, `logo`, `banner`, `favicon`, `primaryColor`, `secondaryColor` |
| Ecommerce | `ecommerceEnabled`, `cartEnabled`, `checkoutEnabled`, `currency` |
| Contacto | `phone`, `whatsapp`, `email` |
| Ubicación | `locationEnabled`, `address`, `city`, `province`, `country`, `postalCode`, `mapsUrl` |
| Redes sociales | `instagram`, `facebook`, `tiktok`, `x`, `youtube`, `linkedin` |
| SEO | `metaTitle`, `metaDescription` |
| Legal | `termsAndConditions`, `privacyPolicy` |
| Sistema | `maintenanceMode`, `language` |

### Uso del contexto

```typescript
// En cualquier Client Component
const pageConfig = usePageConfig();
// Acceso: pageConfig?.pageConfig?.storeName
```

---

## Sistema de Carrito

El carrito se gestiona con `CartContext` (`src/context/CartContext.tsx`):

- Persiste en **localStorage** con la clave `tech_cart`
- El `CartProvider` está en `LayoutComponent.tsx`
- Expone: `cartItems`, `addToCart()`, `updateQty()`, `removeItem()`, `cartCount`, `isCartOpen`, `openCart()`, `closeCart()`

---

## Paleta de Colores por Contexto

### Panel de administración (dashboard, providers, sizes, movements)
```
bg-black / bg-neutral-950 / bg-neutral-900
texto: white / neutral-200
acento: amber-500 (iconos, bordes activos, botones)
```

### Tienda pública y catálogo (productos, categorías, formularios)
```css
--bg-soft: #f0fafa   /* fondo suave */
--bg-medium: #e0f5f5 /* inputs, tags */
--border: #b2dede    /* bordes */
--accent: #4ab8b8    /* cyan acento */
--teal-dk: #0d5c63   /* verde marino */
--teal-dkk: #083d42  /* títulos */
--text: #0d2b2e      /* texto principal */
--text-secondary: #4a7c80
```

### Panel de configuración (admin/pageConfig)
```
bg-black/40 con bordes border-neutral-900
Acento: cyan-500
Botones de acción: bg-cyan-500 text-black
```

---

## Variantes del Componente Button

Definidas con CVA en `src/components/ui/button.tsx`:

| Variante | Uso |
|---|---|
| `default` | Primario amber/dorado |
| `destructive` | Destructivo rojo |
| `outline` | Borde sin relleno |
| `secondary` | Secundario gris |
| `ghost` | Sin fondo |
| `link` | Estilo link |
| `celeste` | Gradiente celeste (tienda) |
| `rojo` | Gradiente rojo |
| `verde` | Gradiente verde |
| `amarillo` | Gradiente amarillo (admin) |
| `blanco` | Claro con borde |
| `hero` | Grande para CTA principal |
| `outline-celeste` | Borde celeste |

---

## Convenciones de Código

### Nomenclatura

- **Comentarios, variables y funciones**: siempre en **español**
- **Tipos TypeScript**: en inglés (convención de la librería/framework)
- **Nombres de archivos**: camelCase para componentes React, kebab-case para utilidades
- **Rutas de API y Server Actions**: usando el estándar de Next.js

### Patrones de componentes

```typescript
// Client Component con estado
"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { accionServidor } from "@/actions/modulo";

export default function ComponenteEjemplo({ dato }: { dato: any }) {
  const [estaCargando, iniciarTransicion] = useTransition();

  const manejarGuardado = () => {
    iniciarTransicion(async () => {
      const res = await accionServidor(datos);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("Guardado correctamente");
    });
  };
  // ...
}
```

### Serialización obligatoria

Prisma retorna objetos `Decimal` que Next.js no puede serializar entre Server/Client. **Siempre** usar `serializeData()`:

```typescript
import { serializeData } from "@/lib/utils";
const datos = serializeData(resultadoPrisma);
```

---

## Rutas y Páginas

### Rutas Públicas (sin autenticación)

| Ruta | Descripción |
|---|---|
| `/` | Inicio con hero slider y grilla de categorías |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario |
| `/productos` | Catálogo general con filtros |
| `/productos/[categoria]` | Catálogo filtrado por categoría (rutas estáticas) |
| `/productos/item/[id]` | Detalle de producto con variantes |
| `/escuela` | Página de escuela de surf |
| `/personalizado` | Diseñador de tablas custom con WhatsApp |

### Rutas Admin (requiere ADMIN)

| Ruta | Descripción |
|---|---|
| `/dashboard` | Inventario de productos con CRUD |
| `/categories` | Gestión de categorías y subcategorías |
| `/provider` | Gestión de proveedores |
| `/sizes` | Gestión de grupos de talles |
| `/movements` | Historial de movimientos de stock |
| `/admin/pageConfig` | Configuración visual del sitio |

---

## Generación de Rutas Estáticas

Las páginas de categoría usan `generateStaticParams` para pre-renderizar:

```typescript
// src/app/productos/[categoria]/page.tsx
export async function generateStaticParams() {
  const categorias = await prisma.category.findMany({
    where: { active: true },
    select: { name: true },
  });
  return categorias.map((c) => ({ categoria: c.name.toLowerCase() }));
}
```

---

## Flujo de Autenticación Legal (AppGate)

El componente `AppGate` controla el acceso mediante tres modales secuenciales:

1. **CookieModal** → bloquea toda la app hasta aceptar
2. **PrivacyModal** → se abre automáticamente después de cookies (se guarda `privacySeen`)
3. **TermsModal** → requiere checkbox + botón aceptar (se guarda `termsAccepted`)

Solo cuando `cookiesAcknowledged && termsAccepted` el contenido se renderiza.

---

## Notas Importantes y Problemas Conocidos

### Archivo mal nombrado
`src/components/admin/page-config/ContactSection.tsx` en realidad contiene el componente `ImageUploader`, no una sección de contacto. La sección de contacto real está en el formulario del admin. Tener cuidado al importar.

### Navbar.jsx vacío
`src/components/layout/Navbar.jsx` es un componente legado vacío. El navbar real está en `Header.tsx`.

### ProductLayout.jsx (legado)
`src/components/products/layouts/ProductLayout.jsx` usa datos mock de `data.js` y `localStorage`. Es el layout original antes de la integración con la base de datos. Se sigue usando como wrapper en `HomeClient.tsx`.

### PageConfig id hardcodeado
Algunas acciones de `page-config/` usan `{ where: { id: 1 } }` como integer en lugar del string que retorna Prisma. Verificar si hay mismatch de tipos al modificar estas acciones.

### Prisma output personalizado
El cliente Prisma se genera en `../../generated/prisma/client` (relativo a `src/lib/`). Si se mueven archivos, actualizar el import path.

### SSL en base de datos
En `src/lib/prisma.ts`, SSL se desactiva automáticamente si `DATABASE_HOST` es `localhost` o `127.0.0.1`. En producción con host remoto, SSL está activo.

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (con Turbopack)
npm run dev

# Build de producción
npm run build
# (ejecuta: prisma generate + prisma db push + next build)

# Iniciar en producción
npm start

# Linting
npm run lint

# Prisma
npx prisma generate          # Regenerar cliente
npx prisma db push           # Sincronizar schema sin migración
npx prisma studio            # GUI de base de datos
npx prisma migrate dev       # Crear migración
```

---

## Integración de Cloudinary — Configuración

Para que las imágenes funcionen correctamente, configurar en el dashboard de Cloudinary:

1. Crear un **Upload Preset** de tipo "unsigned" → guardar como `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
2. Las imágenes del branding se suben a la carpeta `gestion-stock/{slug-del-negocio}/branding/`
3. Las imágenes de productos se suben a `gestion-stock/garments/`

---

## Flujo Completo: Crear un Producto

1. Desde `/dashboard`, el botón "+ Nuevo Producto" abre `ProductModal`
2. El usuario selecciona categoría → subcategoría (filtra talles disponibles)
3. Se suben imágenes directamente a Cloudinary desde el frontend
4. Al guardar, se llama `createGarment(data)` en `src/actions/garments.ts`
5. La acción valida con `garmentSchema`, crea el `Garment` + `GarmentVariant[]` + `GarmentImage[]` en una transacción
6. Se invalida el caché de `/dashboard` con `revalidatePath`

---

## Flujo Completo: Movimiento de Stock

1. Desde `/dashboard`, el botón "Movimientos" abre `MovementModal`
2. Se selecciona producto/variante, tipo (IN/OUT), cantidad y precio
3. Se llama `createMovement(data)` en `src/actions/movements.ts`
4. La acción valida stock disponible para egresos
5. Crea el registro `Movement` y actualiza `GarmentVariant.stock` en una transacción Prisma
6. El historial completo se ve en `/movements`