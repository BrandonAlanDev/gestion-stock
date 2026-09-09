# PENDIENTES

---

# PLAN DE OPTIMIZACIÓN DE RENDIMIENTO — AUDITORÍA INTEGRAL

> **Este documento es autocontenido**: está escrito para que cualquier IA (incluso de bajo razonamiento) pueda ejecutar el plan SIN volver a investigar el proyecto. Cada paso trae: archivo exacto, código actual, código nuevo exacto, riesgos y verificación. **NO saltear pasos ni inventar cambios adicionales.** Si un archivo no coincide con lo descrito (alguien lo modificó antes), LEERLO primero y adaptar preservando el objetivo del paso.

---

## 0. DIAGNÓSTICO (por qué está lento — evidencia verificada)

La lentitud de productos/categorías NO tiene una causa única. Son 3 frentes, en orden de impacto:

1. **IMÁGENES a resolución completa** (causa #1 de lentitud visual):
   - `next.config.ts:22` tiene `unoptimized: true` → next/image no optimiza nada.
   - `src/lib/services/cloudinary-service.ts:29-32`: la subida a Cloudinary solo aplica `format: webp` + `fetch_format auto, quality auto` — NO redimensiona. Las fotos originales (2000-4000px) se sirven completas en cards de ~500px.
   - `src/components/providers/products/grid/ProductGrid.tsx:44-49`: usa `<img>` plano SIN `loading="lazy"` (página pública de categoría: las 12 imágenes bajan ávidamente).
   - `src/components/providers/products/cards/ProductCard.tsx:23-37`: en hover, un `setInterval` de 2s cicla imágenes completas; además `images` es un array NUEVO en cada render (bug de dependencias) → el intervalo se reinicia constantemente.
   - Métrica real (Lighthouse `.unlighthouse`, 2026-04-17): **LCP 4,6s / FCP 2,9s** en `/`.

2. **El catálogo `/productos` no tiene cache de servidor ni SSR**:
   - `src/lib/cache.ts:18-26`: `getCachedProducts` es un PASSTHROUGH (el propio comentario dice "sin caché por closure"). Cada carga/página/filtro ejecuta 2 consultas Prisma vía server action POST (no cacheable).
   - `src/app/productos/page.tsx:1-5`: renderiza solo `<CatalogoClient />` sin datos → pantalla de carga + round-trip en cada visita.
   - `revalidateTag("products")` (en `garments.ts:69,211,254` y `movements.ts:50`) es un tag HUÉRFANO: no existe ninguna entrada de caché con ese tag → las invalidaciones no hacen nada hoy.
   - `src/actions/garments.ts:119-131` (`getGarmentsByNames`): por cada carga filtrada ejecuta `prisma.category.findMany()` (tabla completa, sin where) + `prisma.subCategory.findMany()` secuenciales para resolver nombre→id en JavaScript.

3. **Pila de latencia por request (transversal)**:
   - `src/middleware.ts:102-107`: en CADA ruta pública hace un fetch HTTP a su propia API `/api/mantenimiento` (`cache: "no-store"`) → reentrada al servidor + 1 query Prisma (`src/app/api/mantenimiento/route.ts:8`). En rutas de módulos (`/escuela`, etc.) suma OTRO fetch a `/api/paginas-config`.
   - `src/app/layout.tsx:92-93`: `await auth()` convierte TODO el sitio en dinámico (sin ISR posible) y `getPageConfig()` (en `src/actions/page-config/general.actions.ts:5-110`) consulta Prisma SIN `unstable_cache` en cada render de cada página (incluye banners + grids + carousels). La versión cacheada ya existente `getCachedPageConfig` (`lib/cache.ts:11-15`) está MUERTA (nadie la importa) y además no trae los includes.
   - `src/actions/search.ts:20-78`: 4 queries Prisma SECUENCIALES (todos los productos con imagen, categorías, subcategorías, páginas) ejecutadas al montar la barra de búsqueda del header en TODAS las páginas (1ª visita por sesión).

**Secundarios verificados**: N+1 en dashboard (20 server actions `getGarmentById` al montar la tabla), bug real que ROMPE la creación de proveedores, paginación ROTA en `/productos/[categoria]`, `getMovements` sin paginar, `CartContext` sin memo, 120 `any`, ~2.900 líneas de código muerto, 12 dependencias sin uso, índices faltantes.

**Por qué el usuario "ya tiene cache y sigue lento"**: las capas de cache existen (TanStack en cliente, `unstable_cache` para categorías/proveedores/talles) pero NINGUNA cubre el listado de productos, y las imágenes anulan la percepción de velocidad aunque los datos lleguen.

---

## REGLAS DE EJECUCIÓN (OBLIGATORIAS PARA QUIEN IMPLEMENTE)

1. Ejecutar los bloques EN ORDEN (1 → 11). Cada bloque es independiente y verificable por separado.
2. **Un cambio lógico por vez.** No mezclar bloques en un solo commit mental; verificar TypeScript después de cada bloque.
3. Después de CADA bloque: `npx tsc --noEmit` (el proyecto NO tiene script typecheck; `npm run build` requiere BD) y `npm run lint`. Si hay errores, corregirlos antes de seguir.
4. NO modificar archivos que no estén listados en el paso. NO refactorizar de más. NO eliminar código que no figure en el Bloque 11.
5. Reglas del proyecto (AGENTS.md): español en código/mensajes, una función exportada por archivo (excepto actions CRUD), archivos ≤400 líneas, imports con `@/`, PROHIBIDO `any` nuevo.
6. Al editar con herramientas de reemplazo: usar el texto EXACTO del archivo como ancla. Si no coincide, leer el archivo primero.
7. NO ejecutar `npm run build` salvo que se indique (ejecuta `prisma db push --accept-data-loss`, requiere BD).
8. Baseline para comparar: LCP 4,6s / FCP 2,9s (Lighthouse en `.unlighthouse`, 2026-04-17). Si se re-ejecuta Lighthouse, comparar contra estos valores.

---

## BLOQUE 1 (CRÍTICO) — Imágenes: redimensionar en Cloudinary y lazy-load en grids

### Paso 1.1 — NUEVO archivo `src/lib/utilidades/imagen-cloudinary.ts`

> La carpeta `src/lib/utilidades/` NO existe aún; crearla. Este helper es una función PURA (sin importar el SDK de Cloudinary) para poder usarse desde componentes cliente.

Contenido EXACTO del archivo:

```ts
export function obtenerUrlImagenOptimizada(
  url: string | null | undefined,
  anchoMaximo = 600
): string | null {
  if (!url) return null;
  if (!url.includes("/upload/")) return url;
  const transformacion = `w_${anchoMaximo},q_auto,f_auto`;
  return url.replace("/upload/", `/upload/${transformacion}/`);
}
```

Explicación: las URLs de Cloudinary tienen la forma `https://res.cloudinary.com/CLOUD/image/upload/v123/...`. Insertar `w_600,q_auto,f_auto` después de `/upload/` hace que Cloudinary sirva una versión redimensionada a 600px de ancho, calidad y formato automáticos. URLs que no son de Cloudinary (o data:) se devuelven sin cambios. NO valida host (simple a propósito).

### Paso 1.2 — `src/lib/services/cloudinary-service.ts`: redimensionar en subida

En la función `subirImagen` (líneas 29-32), reemplazar:

```ts
  const opciones: UploadApiOptions = {
    format: "webp",
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  };
```

por:

```ts
  const opciones: UploadApiOptions = {
    format: "webp",
    transformation: [
      { width: 1200, height: 1200, crop: "limit", fetch_format: "auto", quality: "auto" },
    ],
  };
```

NOTAS:
- `crop: "limit"` solo reduce las imágenes más grandes de 1200x1200; las más chicas se conservan igual. Las imágenes YA subidas no cambian (las cubre el Paso 1.1 en render).
- NO tocar el resto de `cloudinary-service.ts`.

### Paso 1.3 — `src/components/providers/products/cards/ProductCard.tsx`: corregir bug de deps + URL optimizada + lazy

Cambios EXACTOS (3 ediciones en el mismo archivo):

(a) Agregar import de `useMemo` (línea 5): la línea `import { useEffect, useState } from "react";` pasa a:

```tsx
import { useEffect, useMemo, useState } from "react";
```

(b) Agregar import del helper (después del import de Link, línea 6):

```tsx
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";
```

(c) Reemplazar el bloque de `const images = ...` (líneas 18-21) por:

```tsx
  const images = useMemo(
    () =>
      product.images?.length > 1
        ? product.images.slice(1).map((img: any) => img.srcImage)
        : product.images?.map((img: any) => img.srcImage) || [],
    [product.images]
  );
```

Esto corrige el bug: `images` ya NO cambia de identidad en cada render → el `useEffect` de hover (líneas 23-37) deja de reiniciarse continuamente. NO tocar el useEffect.

(d) Reemplazar el `<Image ... />` (líneas 80-88). Código actual:

```tsx
          <Image
            src={images[currentImage] || "/images/placeholder.avif"}
            alt={product.name}
            width={500}
            height={700}
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.03] mix-blend-multiply ${fade ? "opacity-100" : "opacity-0"
              }`}
            style={{ padding: "12px" }}
          />
```

Reemplazar por:

```tsx
          <Image
            src={obtenerUrlImagenOptimizada(images[currentImage], 600) || "/images/placeholder.avif"}
            alt={product.name}
            width={500}
            height={700}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.03] mix-blend-multiply ${fade ? "opacity-100" : "opacity-0"
              }`}
            style={{ padding: "12px" }}
          />
```

### Paso 1.4 — `src/components/providers/products/grid/ProductGrid.tsx`: URL optimizada + lazy

(a) Agregar import después de la línea 5 (imports de lucide):

```tsx
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";
```

(b) Card (líneas 45-49). Código actual:

```tsx
        {cover ? (
          <img
            src={cover}
            alt={garment.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
```

Reemplazar por:

```tsx
        {cover ? (
          <img
            src={obtenerUrlImagenOptimizada(cover, 600) || undefined}
            alt={garment.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
```

(c) Modal — imagen principal (líneas 155-160). Código actual:

```tsx
                {garment.images[selectedImg] ? (
                  <img
                    src={garment.images[selectedImg].srcImage}
                    alt={garment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
```

Reemplazar por:

```tsx
                {garment.images[selectedImg] ? (
                  <img
                    src={obtenerUrlImagenOptimizada(garment.images[selectedImg].srcImage, 1200) || undefined}
                    alt={garment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
```

(d) Modal — thumbnails (línea 183). Código actual:

```tsx
                      <img src={img.srcImage} alt={img.alt || ""} className="w-full h-full object-cover" />
```

Reemplazar por:

```tsx
                      <img src={obtenerUrlImagenOptimizada(img.srcImage, 200) || undefined} alt={img.alt || ""} loading="lazy" className="w-full h-full object-cover" />
```

### Paso 1.5 (OPCIONAL — riesgo MEDIO, solo si el usuario lo pide) — `next.config.ts`

NO hacer en esta tanda. Si se quisiera reactivar el optimizador de next/image habría que cambiar `unoptimized: true` → quitar la línea, y verificar TODOS los `<Image>` del sitio (riesgo de romper previews con data:). Las transformaciones Cloudinary de los pasos 1.1-1.4 ya resuelven el problema sin ese riesgo.

### Verificación Bloque 1

- `npx tsc --noEmit` y `npm run lint` sin errores.
- Manual: abrir `/productos`, `/productos/<categoria>` y `/productos/item/<id>` → las imágenes se ven correctas y pesan mucho menos (DevTools → Network → buscar respuestas `w_600` en las URLs; imágenes de grid con `loading="lazy"`).
- Hover sobre una card con varias imágenes → el carrusel de imágenes avanza cada 2s SIN reinicios parpadeantes (bug corregido).

---

## BLOQUE 2 (CRÍTICO) — Cache real de productos + SSR inicial del catálogo

### Paso 2.1 — `src/lib/cache.ts`: envolver productos en `unstable_cache`

Reemplazar EXACTO (líneas 17-26). Código actual:

```ts
// ── PRODUCTOS (función directa, sin caché por closure) ──
export async function getCachedProducts(
  page: number,
  limit: number,
  categoryId?: string,
  search?: string,
  subCategoryId?: string
) {
  return garmentService.getGarmentsPaginated(page, limit, categoryId, search, subCategoryId);
}
```

Reemplazar por:

```ts
// ── PRODUCTOS (cache real de servidor, tag "products") ──
export const getCachedProducts = unstable_cache(
  async (
    page: number,
    limit: number,
    categoryId?: string,
    search?: string,
    subCategoryId?: string
  ) => {
    return garmentService.getGarmentsPaginated(page, limit, categoryId, search, subCategoryId);
  },
  ["products"],
  { revalidate: 300, tags: ["products"] }
);
```

POR QUÉ esto es seguro: `unstable_cache` SÍ funciona dentro de server actions (evidencia: `getCachedCategories` ya se usa desde `src/actions/categories.ts:8` y funciona). Con esto, los `revalidateTag("products")` que YA existen (`garments.ts:69,211,254`, `movements.ts:50`) pasan a invalidar un cache real. TTL 5 minutos. La firma de la función y el valor de retorno NO cambian (`{ garments, total }`).

### Paso 2.2 — `src/actions/garments.ts`: eliminar las 2 queries de resolución nombre→id

Reemplazar la función `getGarmentsByNames` (líneas 110-133). Código actual:

```ts
export async function getGarmentsByNames(
  page: number,
  limit: number,
  categoria?: string,
  search?: string,
  subcategoria?: string
) {
  const prisma = (await import("@/lib/prisma")).prisma;
  let categoryId: string | undefined;
  if (categoria) {
    const decoded = decodeURIComponent(categoria).trim().toLowerCase();
    const cats = await prisma.category.findMany();
    const match = cats.find(c => c.id === decoded || c.name.trim().toLowerCase() === decoded);
    categoryId = match?.id;
  }
  let subCategoryId: string | undefined;
  if (subcategoria && categoryId) {
    const decoded = decodeURIComponent(subcategoria).trim().toLowerCase();
    const subs = await prisma.subCategory.findMany({ where: { categoryId } });
    const match = subs.find(s => s.id === decoded || s.name.trim().toLowerCase() === decoded);
    subCategoryId = match?.id;
  }
  return getGarments(page, limit, categoryId, search, subCategoryId);
}
```

Reemplazar por:

```ts
export async function getGarmentsByNames(
  page: number,
  limit: number,
  categoria?: string,
  search?: string,
  subcategoria?: string
) {
  let categoryId: string | undefined;
  let subCategoryId: string | undefined;
  if (categoria || subcategoria) {
    const cats = await getCachedCategories();
    if (categoria) {
      const decoded = decodeURIComponent(categoria).trim().toLowerCase();
      categoryId = cats.find(
        (c) => c.id === decoded || c.name.trim().toLowerCase() === decoded
      )?.id;
    }
    if (subcategoria && categoryId) {
      const decoded = decodeURIComponent(subcategoria).trim().toLowerCase();
      subCategoryId = cats
        .find((c) => c.id === categoryId)
        ?.subCategories.find(
          (s) => s.id === decoded || s.name.trim().toLowerCase() === decoded
        )?.id;
    }
  }
  return getGarments(page, limit, categoryId, search, subCategoryId);
}
```

Y agregar el import (línea 8 del archivo, junto a los otros imports de cache):

```ts
import { getCachedProducts, getCachedProductById, getCachedCategories } from "@/lib/cache";
```

NOTA: se elimina el `await import("@/lib/prisma")` dinámico (ya no se usa). La resolución ahora usa `getCachedCategories` (cache 3600s) → las 2 queries extra por filtro se convierten en 0 en el 99% de los casos.

### Paso 2.3 — `src/app/productos/page.tsx`: SSR con datos iniciales

Reemplazar TODO el archivo (5 líneas). Contenido nuevo EXACTO:

```tsx
import CatalogoClient from "@/components/providers/products/views/CatalogoClient";
import { getCachedCategories, getCachedProducts } from "@/lib/cache";
import { serializeData } from "@/lib/utils";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; categoria?: string; subcategoria?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Number(sp?.page) || 1;
  const limit = 20;
  const categoria = sp?.categoria || undefined;
  const subcategoria = sp?.subcategoria || undefined;

  const categories = await getCachedCategories();

  let categoryId: string | undefined;
  if (categoria) {
    const decoded = decodeURIComponent(categoria).trim().toLowerCase();
    categoryId = categories.find(
      (c) => c.id === decoded || c.name.trim().toLowerCase() === decoded
    )?.id;
  }

  let subCategoryId: string | undefined;
  if (subcategoria && categoryId) {
    const decoded = decodeURIComponent(subcategoria).trim().toLowerCase();
    subCategoryId = categories
      .find((c) => c.id === categoryId)
      ?.subCategories.find(
        (s) => s.id === decoded || s.name.trim().toLowerCase() === decoded
      )?.id;
  }

  const { garments, total } = await getCachedProducts(
    currentPage,
    limit,
    categoryId,
    undefined,
    subCategoryId
  );

  const initialGarments = {
    success: true,
    data: serializeData(garments),
    total,
    page: currentPage,
    totalPages: Math.ceil(total / limit),
  };

  const initialCategories = serializeData(categories);

  return (
    <CatalogoClient
      initialGarments={initialGarments}
      initialCategories={initialCategories}
    />
  );
}
```

NOTAS:
- `serializeData` convierte los `Decimal` de Prisma a `number` (evita problemas de serialización RSC).
- La página se vuelve dinámica por `searchParams` — ya lo era (el layout usa `auth()`), no cambia nada.
- Con el cache del Paso 2.1, esta página hace 2 lecturas de cache en el 99% de los requests (0 queries Prisma).

### Paso 2.4 — `src/components/providers/products/views/CatalogoClient.tsx`: aceptar initialData

(a) Reemplazar la declaración del componente (líneas 11-28). Código actual:

```tsx
export default function CatalogoClient() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = 20;

  const currentPage = Number(searchParams.get("page")) || 1;
  const categoria = searchParams.get("categoria") || undefined;
  const subcategoria = searchParams.get("subcategoria") || undefined;

  const { data: garmentsData, isFetching } = useCatalogGarments(
    currentPage,
    limit,
    categoria,
    undefined,
    subcategoria
  );
  const { data: categoriesData } = useCatalogCategories();
```

Reemplazar por:

```tsx
export default function CatalogoClient({
  initialGarments,
  initialCategories,
}: {
  initialGarments?: {
    success: boolean;
    data: unknown[];
    total: number;
    page: number;
    totalPages: number;
  };
  initialCategories?: unknown[];
}) {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = 20;

  const currentPage = Number(searchParams.get("page")) || 1;
  const categoria = searchParams.get("categoria") || undefined;
  const subcategoria = searchParams.get("subcategoria") || undefined;

  const { data: garmentsData, isFetching } = useCatalogGarments(
    currentPage,
    limit,
    categoria,
    undefined,
    subcategoria,
    initialGarments
  );
  const { data: categoriesData } = useCatalogCategories(initialCategories);
```

(b) Reducir el overlay de carga: en lugar de tapar la pantalla con datos ya visibles, reemplazar (líneas 59-63):

```tsx
      {isFetching && (
        <div className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--color-fondo-sitio)_70%,transparent)] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[var(--color-primario)] animate-spin" />
        </div>
      )}
```

por:

```tsx
      {isFetching && garments.length === 0 && (
        <div className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--color-fondo-sitio)_70%,transparent)] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[var(--color-primario)] animate-spin" />
        </div>
      )}
```

(Solo muestra el spinner cuando NO hay datos que mostrar; con `initialData` la primera visita ya pinta el catálogo en SSR.)

### Verificación Bloque 2

- `npx tsc --noEmit` y `npm run lint` sin errores.
- Manual: cargar `/productos` → el grid aparece de inmediato (sin spinner inicial); filtrar por categoría/subcategoría → sin parpadeo; cambiar página → rápido.
- Verificar en logs de BD o DevTools que crear/editar producto (admin) actualiza el catálogo en ≤5 min (TTL) — las mutaciones ya llaman `revalidateTag("products")`.

---

## BLOQUE 3 (CRÍTICO) — Quitar la query a BD por request del middleware (mantener el self-fetch)

El middleware es Edge runtime: NO puede usar Prisma. En lugar de reescribirlo, se cachea la respuesta de las APIs que consulta (el self-fetch queda, pero ya no pega a BD en cada request).

### Paso 3.1 — `src/app/api/mantenimiento/route.ts`

Reemplazar TODO el archivo (17 líneas). Contenido nuevo EXACTO:

```ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const obtenerMantenimientoActivo = unstable_cache(
  async () => {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: { maintenanceMode: true },
    });
    return pageConfig?.maintenanceMode === true;
  },
  ["mantenimiento-activo"],
  { revalidate: 60, tags: ["page-config"] }
);

export async function GET(): Promise<NextResponse> {
  try {
    const activo = await obtenerMantenimientoActivo();
    return NextResponse.json({ activo });
  } catch (error) {
    console.error("Error al consultar el modo mantenimiento:", error);
    return NextResponse.json({ activo: false }, { status: 500 });
  }
}
```

NOTAS:
- TTL 60s: el toggle de mantenimiento tarda hasta 1 minuto en propagarse. `updatePageFlags` ya llama `revalidateTag("page-config")` → al cambiar el toggle se invalida al instante.
- Fail-open conservado (error → `{ activo: false }`).

### Paso 3.2 — `src/app/api/paginas-config/route.ts`

Reemplazar TODO el archivo (25 líneas). Contenido nuevo EXACTO:

```ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const obtenerModulosActivos = unstable_cache(
  async () => {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: { escuelaEnabled: true, arreglosEnabled: true, personalizadoEnabled: true, planAhorroEnabled: true },
    });
    return {
      escuelaEnabled: pageConfig?.escuelaEnabled === true,
      arreglosEnabled: pageConfig?.arreglosEnabled === true,
      personalizadoEnabled: pageConfig?.personalizadoEnabled === true,
      planAhorroEnabled: pageConfig?.planAhorroEnabled === true,
    };
  },
  ["modulos-activos"],
  { revalidate: 60, tags: ["page-config"] }
);

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await obtenerModulosActivos());
  } catch (error) {
    console.error("Error al consultar los módulos de páginas:", error);
    return NextResponse.json(
      { escuelaEnabled: false, arreglosEnabled: false, personalizadoEnabled: false, planAhorroEnabled: false },
      { status: 500 }
    );
  }
}
```

NO tocar `src/middleware.ts` ni `consultar-mantenimiento.ts` (siguen funcionando igual, pero ahora el GET responde desde caché).

### Verificación Bloque 3

- `npx tsc --noEmit` y `npm run lint`.
- Manual: activar mantenimiento en `/admin/pageConfig` → visitar `/productos` anónimo → redirige a `/mantenimiento` (hasta 1 min si no hubo invalidation... con `revalidateTag` debe ser inmediato). Desactivar → vuelve.
- Verificar que `/escuela` sigue devolviendo 404 cuando el módulo está desactivado.

---

## BLOQUE 4 (ALTO) — Cachear `getPageConfig` (se ejecuta en CADA página)

### Paso 4.1 — `src/actions/page-config/general.actions.ts`

Dos ediciones en este archivo:

(a) Agregar import (después de la línea 3 `import { prisma } from "@/lib/prisma";`):

```ts
import { unstable_cache } from "next/cache";
```

(b) Convertir la función en constante cacheada. Reemplazar (línea 5):

```ts
export async function getPageConfig() {
```

por:

```ts
export const getPageConfig = unstable_cache(
  async () => {
```

Y reemplazar el cierre actual de la función (líneas 103-109):

```ts
  } catch (error: unknown) {
    console.error("Error real:", error instanceof Error ? error.message : error);
    return {
      ok: false,
      error: "Error configuración",
    };
  }
}
```

por:

```ts
  } catch (error: unknown) {
    console.error("Error real:", error instanceof Error ? error.message : error);
    return {
      ok: false,
      error: "Error configuración",
    };
  }
  },
  ["page-config-completa"],
  { revalidate: 3600, tags: ["page-config"] }
);
```

CUIDADO: el cuerpo interno (líneas 6-102) NO cambia. Verificar que el archivo quede con la forma `export const getPageConfig = unstable_cache(async () => { ... }, [...], {...});`.

POR QUÉ: todos los importadores (`src/app/layout.tsx:26-28`, `src/app/admin/layout.tsx:25`, `src/app/page.tsx`, páginas admin, `EstilosApariencia.tsx`) pasan a compartir UN cache de 1h invalidado por los `revalidateTag("page-config")` que YA existen en todas las acciones de page-config. El `React.cache()` del layout queda redundante (no molesta; NO tocarlo).

### Verificación Bloque 4

- `npx tsc --noEmit` y `npm run lint`.
- Manual: navegar varias páginas → sin regresión visual de colores/logo/footer. Editar branding en admin → el home refleja el cambio de inmediato (invalidation por tag).

---

## BLOQUE 5 (ALTO) — Consultas Prisma: paginar movimientos, paralelizar búsqueda, transacción de variantes

### Paso 5.1 — `src/actions/movements.ts`: paginar `getMovements`

Reemplazar la función (líneas 58-73). Código actual:

```ts
export async function getMovements() {
  const movements = await prisma.movement.findMany({
    include: {
      garmentVariant: {
        include: {
          garment: true,
          size: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return movements;
}
```

Reemplazar por:

```ts
export async function getMovements(page = 1, limit = 100) {
  const skip = (page - 1) * limit;
  const [movements, total] = await Promise.all([
    prisma.movement.findMany({
      include: {
        garmentVariant: {
          include: {
            garment: true,
            size: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.movement.count(),
  ]);
  return { movements, total };
}
```

Actualizar los DOS consumidores:

(a) `src/app/movements/page.tsx` (server, línea 5): reemplazar:

```tsx
  const movements = await getMovements();
```

por:

```tsx
  const { movements } = await getMovements(1, 100);
```

(b) `src/app/admin/movements/page.tsx` (client, línea 24): reemplazar:

```tsx
  useEffect(() => { getMovements().then(d => { setMovements(d); setLoading(false); }); }, []);
```

por:

```tsx
  useEffect(() => { getMovements(1, 100).then(d => { setMovements(d.movements); setLoading(false); }); }, []);
```

NOTA: se muestra el historial limitado a los 100 más recientes (antes cargaba TODA la tabla sin límite — la peor consulta del proyecto). Si el usuario quiere ver todo el historial, queda pendiente agregar UI de paginación (fuera de esta tanda).

### Paso 5.2 — `src/actions/movements.ts`: sanear mensaje de error (mismo archivo)

Reemplazar (línea 54):

```ts
    return { error: error.message || "Error al registrar movimiento" };
```

por:

```ts
    return { error: "Error al registrar movimiento" };
```

Y cambiar (línea 52) `catch (error: any)` por `catch (error: unknown)` (la variable `error` solo se usa en el console.error de la línea 53, no se toca eso).

### Paso 5.3 — `src/actions/search.ts`: paralelizar las 4 queries

Reemplazar TODA la función `getGlobalSearchIndex` (líneas 15-97). Contenido nuevo EXACTO:

```ts
export async function getGlobalSearchIndex(): Promise<SearchItem[]> {
  try {
    const searchIndex: SearchItem[] = [];

    const [garments, categories, subCategories, customPages] = await Promise.all([
      prisma.garment.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          images: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { srcImage: true }
          }
        }
      }),
      prisma.category.findMany({
        where: { active: true },
        select: { id: true, name: true }
      }),
      prisma.subCategory.findMany({
        where: { active: true },
        include: {
          category: {
            select: { name: true }
          }
        }
      }),
      prisma.customPage.findMany({
        where: { isActive: true },
        select: { id: true, title: true, slug: true }
      }),
    ]);

    garments.forEach(g => {
      searchIndex.push({
        id: g.id,
        type: 'product',
        title: g.name,
        url: `/productos/item/${g.id}`,
        imageUrl: g.images.length > 0 ? g.images[0].srcImage : null
      });
    });

    categories.forEach(c => {
      searchIndex.push({
        id: c.id,
        type: 'category',
        title: c.name,
        url: `/productos?categoria=${encodeURIComponent(c.name)}`,
      });
    });

    subCategories.forEach(s => {
      searchIndex.push({
        id: s.id,
        type: 'subcategory',
        title: s.name,
        url: `/productos?categoria=${encodeURIComponent(s.category.name)}&subcategoria=${encodeURIComponent(s.name)}`,
      });
    });

    customPages.forEach(cp => {
      searchIndex.push({
        id: cp.id,
        type: 'page',
        title: cp.title,
        url: `/page?title=${encodeURIComponent(cp.slug)}`,
      });
    });

    return searchIndex;
  } catch (error) {
    console.error("Error cargando índice de búsqueda de la base de datos:", error);
    return [];
  }
}
```

NOTA: las 4 queries corren en paralelo (antes: secuenciales). NO cachear esta función por ahora (depende de que el índice esté fresco; se evalúa después).

### Paso 5.4 — `src/lib/services/garment-service.ts`: transacción + paralelismo en variantes

Reemplazar el bloque "2. Sincronizar variantes" (líneas 105-141). Código actual:

```ts
  // 2. Sincronizar variantes
  const currentVariants = await prisma.garmentVariant.findMany({ where: { garmentId: id } });
  const currentVariantIds = currentVariants.map((v) => v.id);
  const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id!);

  // Eliminar las que ya no están
  const idsToDelete = currentVariantIds.filter((vid) => !incomingVariantIds.includes(vid));
  if (idsToDelete.length > 0) {
    await prisma.garmentVariant.deleteMany({ where: { id: { in: idsToDelete } } });
  }

  // Actualizar existentes o crear nuevas
  for (const v of variants) {
    if (v.id) {
      await prisma.garmentVariant.update({
        where: { id: v.id },
        data: {
          sku: v.sku,
          stock: Number(v.stock),
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          attributes: v.attributes ?? undefined,
        },
      });
    } else {
      await prisma.garmentVariant.create({
        data: {
          garmentId: id,
          sku: v.sku,
          stock: Number(v.stock),
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          attributes: v.attributes ?? undefined,
        },
      });
    }
  }
```

Reemplazar por:

```ts
  // 2. Sincronizar variantes (transaccional y paralelo)
  await prisma.$transaction(async (tx) => {
    const currentVariants = await tx.garmentVariant.findMany({ where: { garmentId: id } });
    const currentVariantIds = currentVariants.map((v) => v.id);
    const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id as string);

    const idsToDelete = currentVariantIds.filter((vid) => !incomingVariantIds.includes(vid));
    if (idsToDelete.length > 0) {
      await tx.garmentVariant.deleteMany({ where: { id: { in: idsToDelete } } });
    }

    await Promise.all(
      variants.map((v) => {
        const data = {
          sku: v.sku,
          stock: Number(v.stock),
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          attributes: v.attributes ?? undefined,
        };
        if (v.id) {
          return tx.garmentVariant.update({ where: { id: v.id }, data });
        }
        return tx.garmentVariant.create({ data: { garmentId: id, ...data } });
      })
    );
  });
```

NOTA: antes, un fallo a mitad del loop dejaba el producto con variantes a medio actualizar. Ahora es atómico y las actualizaciones corren en paralelo.

### Verificación Bloque 5

- `npx tsc --noEmit` y `npm run lint`.
- Manual: `/movements` y `/admin/movements` muestran los 100 movimientos más recientes; crear un movimiento sigue actualizando stock y mostrándose al tope. Editar un producto (agregar/quitar/editar variantes) funciona igual que antes. Buscador del header sigue funcionando.

---

## BLOQUE 6 (ALTO) — N+1 del dashboard: un solo ProductModal on-demand

### Paso 6.1 — `src/components/providers/products/modals/QuickViewTable.tsx`

El problema: cada fila monta un `<ProductModal>` (líneas 198-204) y cada modal hace una server action `getGarmentById` al montar (en `ProductModal.tsx:71-77`), aunque esté cerrado. Solución: mover el modal FUERA del `map`, montado una sola vez con el producto elegido.

(a) Agregar estado (después de la línea 27, junto a los otros useState):

```tsx
  const [editingGarment, setEditingGarment] = useState<any | null>(null);
```

(b) Reemplazar el bloque de acciones de la fila (líneas 196-214). Código actual:

```tsx
                  {/* Acciones */}
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-4">
                      <ProductModal
                        garment={item}
                        categories={categories}
                        sizes={sizeTypes}
                        providers={providers}
                        colors={colors || []}
                      />
                      <button
                        onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
```

Reemplazar por:

```tsx
                  {/* Acciones */}
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => setEditingGarment(item)}
                        className="transition-colors cursor-pointer opacity-40 hover:opacity-100"
                        style={{ color: textColor }}
                        title="Editar producto"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
```

(c) Agregar el import de `Edit3` (línea 4): la línea `import { Trash2 } from "lucide-react";` pasa a:

```tsx
import { Trash2, Edit3 } from "lucide-react";
```

(d) Agregar el modal único DESPUÉS del cierre de la tabla, junto al modal de proveedor (después de la línea 229, el cierre de `</ProviderModal>...}`). Insertar antes de `{/* ── DIÁLOGO DE CONFIRMACIÓN ── */}`:

```tsx
      {/* ── MODAL PRODUCTO (uno solo, on-demand) ── */}
      {editingGarment && (
        <ProductModal
          garment={editingGarment}
          categories={categories}
          sizes={sizeTypes}
          providers={providers}
          colors={colors || []}
          onSuccess={() => setEditingGarment(null)}
        />
      )}
```

NOTA: `ProductModal` renderiza su propio botón de apertura cuando está cerrado (ver `ProductModal.tsx:123-140`); al montarlo con `garment` setea el formulario en modo edición. El efecto de montaje `getGarmentById` (`ProductModal.tsx:71-77`) ahora se dispara UNA vez (solo al hacer clic en el lápiz), no 20 veces.

### Paso 6.2 — `src/components/dashboard/DashboardClient.tsx`: invalidar query tras guardar desde la tabla

(a) En la línea donde se renderiza `QuickViewTable` (líneas 119-121 aprox.), localizar:

```tsx
          <QuickViewTable
            garments={garments}
```

y agregar una prop en esa invocación. La línea que sigue lista `categories={categories}`, `sizeTypes={sizeTypes}`, `providers={providers}`, `colors={colors}`. Agregar:

```tsx
            onProductsChanged={invalidateProducts}
```

(b) En `QuickViewTable.tsx`, declarar la prop y usarla: en la firma del componente (línea 23) reemplazar:

```tsx
export default function QuickViewTable({ garments, categories, sizeTypes, providers, colors }: any) {
```

por:

```tsx
export default function QuickViewTable({ garments, categories, sizeTypes, providers, colors, onProductsChanged }: {
  garments: any[];
  categories: any[];
  sizeTypes: any[];
  providers: any[];
  colors: any[];
  onProductsChanged?: () => void;
}) {
```

(c) En el modal único del Paso 6.1 (d), pasar la invalidación:

```tsx
          onSuccess={() => {
            setEditingGarment(null);
            onProductsChanged?.();
          }}
```

POR QUÉ: hoy editar/crear un producto desde la tabla NO refresca la grilla del dashboard (el modal no recibía `onSuccess`). Con esto, tras guardar se invalida `["garments"]`.

### Verificación Bloque 6

- `npx tsc --noEmit` y `npm run lint`.
- Manual: abrir dashboard → la red NO debe mostrar 20 llamadas a `getGarmentById` (solo al hacer clic en el lápiz). Editar un producto desde la fila → al guardar, la tabla se actualiza sin recargar la página. Crear producto desde el header sigue funcionando.

---

## BLOQUE 7 (MEDIO) — TanStack Query: defaults correctos y provider duplicado

### Paso 7.1 — `src/providers/QueryProvider.tsx`

Reemplazar las líneas 9-16. Código actual:

```tsx
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            retry: 1,
          },
        },
      })
```

Reemplazar por:

```tsx
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            gcTime: 10 * 60 * 1000, // 10 minutos
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
```

POR QUÉ: `refetchOnWindowFocus` estaba en el default `true` de TanStack v5 → cada vez que el usuario volvía a la pestaña, se disparaban refetchs a Prisma vía server actions.

### Paso 7.2 — `src/app/dashboard/layout.tsx`: eliminar el QueryProvider duplicado

Reemplazar TODO el archivo (5 líneas). Contenido nuevo:

```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

POR QUÉ: `QueryProvider` ya está montado en el layout raíz (`src/app/layout.tsx:107`). Dos providers = dos caches de TanStack separadas (las invalidaciones de un lado no veían al otro).

### Paso 7.3 — `src/hooks/useCatalogCategories.tsx`: unificar query key

Reemplazar la línea 7 `queryKey: ["catalogCategories"],` por:

```tsx
    queryKey: ["categories"],
```

POR QUÉ: `useCategories` (dashboard) ya usa `["categories"]` con la MISMA acción `getCategories`. Con la key unificada, ambos comparten cache e invalidaciones (el dashboard usa staleTime Infinity pero cada observer define su propio staleTime, sin conflicto).

### Verificación Bloque 7

- `npx tsc --noEmit` y `npm run lint`.
- Manual: dashboard carga productos igual que antes; crear/editar categoría en admin y volver al dashboard → la categoría nueva aparece (o al recargar). Cambiar de pestaña y volver → NO se disparan refetchs (Network).

---

## BLOQUE 8 (ALTO) — Bugs funcionales: crear proveedor, paginación de categoría, CartContext

### Paso 8.1 — BUG: crear proveedor siempre falla (tipos incorrectos)

(a) `src/lib/services/provider-service.ts`: reemplazar la función `createProvider` (líneas 13-17). Código actual:

```ts
export async function createProvider(data: any) {
  return prisma.$transaction(async (tx) => {
    return tx.provider.create({ data });
  });
}
```

Reemplazar por:

```ts
export async function createProvider(data: {
  name: string;
  details?: string | null;
  contacts: { create: Array<{ contact: string; type: "EMAIL" | "PHONE" }> };
}) {
  return prisma.$transaction(async (tx) => {
    return tx.provider.create({ data, include: { contacts: true } });
  });
}
```

(b) `src/actions/providers.ts`: reemplazar la llamada (líneas 21-33). Código actual:

```ts
    const provider = await providerService.createProvider({
      data: {
        name,
        details,
        contacts: {
          create: contacts.map((c) => {
            const contact = normalizeContact(c);
            return { contact, type: getContactType(contact) };
          }),
        },
      },
      include: { contacts: true },
    });
```

Reemplazar por:

```ts
    const provider = await providerService.createProvider({
      name,
      details,
      contacts: {
        create: contacts.map((c) => {
          const contact = normalizeContact(c);
          return { contact, type: getContactType(contact) };
        }),
      },
    });
```

EXPLICACIÓN del bug: la acción enviaba `{ data: {...}, include: {...} }` y el servicio hacía `create({ data })` → Prisma recibía `{ data: { data: {...}, include: {...} } }` (campos inexistentes) y tiraba `PrismaClientValidationError` que el `catch` tragaba como "Error al crear". Con el tipado real, el bug queda imposible de reintroducir.

(c) Mismo archivo `src/actions/providers.ts`, línea 36: cambiar `catch (e: any)` por `catch (e: unknown)` y en línea 37 `if (e.code === "P2002")` por `if ((e as { code?: string })?.code === "P2002")`.

### Paso 8.2 — BUG: paginación rota en `/productos/[categoria]`

`src/components/ui/pagination.tsx` (30 líneas): reemplazar TODO el archivo. Contenido nuevo EXACTO:

```tsx
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  basePath,
  searchParams,
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const armarHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams || {}).forEach(([clave, valor]) => {
      if (valor) params.set(clave, valor);
    });
    if (page > 1) params.set("page", String(page));
    const consulta = params.toString();
    return `${basePath || "?"}${consulta ? `?${consulta}` : ""}`;
  };

  const claseBoton =
    "cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="flex justify-center gap-4 mt-12">
      {basePath ? (
        <Link
          href={armarHref(currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className={`${claseBoton} ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          ← Anterior
        </Link>
      ) : (
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className={claseBoton}
        >
          ← Anterior
        </button>
      )}
      <span>Página {currentPage} de {totalPages}</span>
      {basePath ? (
        <Link
          href={armarHref(currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className={`${claseBoton} ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Siguiente →
        </Link>
      ) : (
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className={claseBoton}
        >
          Siguiente →
        </button>
      )}
    </div>
  );
}
```

NOTA: la página `src/app/productos/[categoria]/page.tsx:85-90` YA pasa `basePath` y `searchParams`; con este cambio los botones navegan por URL real (server rendering por página). La ruta `/productos` (catálogo principal) sigue usando `onPageChange` (client) — ambos modos soportados.

### Paso 8.3 — `src/context/CartContext.tsx`: memoizar el value + try/catch en localStorage

(a) Agregar `useMemo` al import (línea 2). La línea `import { createContext, useState, useEffect, useContext, ReactNode } from "react";` pasa a:

```tsx
import { createContext, useState, useEffect, useContext, useMemo, ReactNode } from "react";
```

(b) Reemplazar el efecto de lectura (líneas 21-24). Código actual:

```tsx
  useEffect(() => {
    const saved = localStorage.getItem("tech_cart");
    if (saved) setCartItems(JSON.parse(saved));
  }, []);
```

Reemplazar por:

```tsx
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tech_cart");
      if (saved) setCartItems(JSON.parse(saved));
    } catch {
      localStorage.removeItem("tech_cart");
    }
  }, []);
```

(c) Reemplazar el efecto de escritura (líneas 26-28). Código actual:

```tsx
  useEffect(() => {
    localStorage.setItem("tech_cart", JSON.stringify(cartItems));
  }, [cartItems]);
```

Reemplazar por:

```tsx
  useEffect(() => {
    try {
      localStorage.setItem("tech_cart", JSON.stringify(cartItems));
    } catch {
      // sin acción: el carrito sigue funcionando en memoria
    }
  }, [cartItems]);
```

(d) Reemplazar el provider (líneas 57-61). Código actual:

```tsx
  return (
    <CartContext.Provider value={{ cartItems, isCartOpen, openCart, closeCart, addToCart, updateQty, removeItem, updateCartItemSpecs }}>
      {children}
    </CartContext.Provider>
  );
```

Reemplazar por:

```tsx
  const valor = useMemo(
    () => ({ cartItems, isCartOpen, openCart, closeCart, addToCart, updateQty, removeItem, updateCartItemSpecs }),
    [cartItems, isCartOpen]
  );

  return (
    <CartContext.Provider value={valor}>
      {children}
    </CartContext.Provider>
  );
```

POR QUÉ: el value era un objeto literal nuevo en CADA render del provider → cada interacción re-renderizaba todo el árbol consumidor (Header con 2 buscadores, filas del carrito, catálogo). Con `useMemo` solo re-renderizan cuando cambian `cartItems` o `isCartOpen`. (Una división de contextos en 2 es mejora futura, NO en esta tanda.)

### Verificación Bloque 8

- `npx tsc --noEmit` y `npm run lint`.
- Manual: crear un proveedor desde `/admin/provider` → se crea (antes fallaba siempre con "Error al crear"). Paginar en `/productos/<categoria>` → "Anterior"/"Siguiente" navegan. Carrito: agregar, sumar, quitar, persistencia tras recargar; abrir/cerrar sin que la página entera se congele.

---

## BLOQUE 9 (MEDIO) — Índices de base de datos

### Paso 9.1 — `prisma/schema.prisma`

Agregar EXACTAMENTE estas líneas en los modelos indicados (dentro de cada modelo, junto a los `@@index` existentes):

1. Modelo `Garment` (líneas 72-94): agregar después de la línea 91 (`@@index([categoryId])`):

```prisma
  @@index([categoryId, createdAt])
  @@index([subCategoryId, createdAt])
```

2. Modelo `Movement` (líneas 183-194): agregar después de la línea 193 (`@@index([variantId])`):

```prisma
  @@index([type, createdAt])
```

3. Modelo `CustomSection` (líneas 381-393): agregar antes de `@@map("CustomPageSections")`:

```prisma
  @@index([pageId])
```

4. Modelo `CustomSectionItem` (líneas 395-408): agregar antes de `@@map("CustomPageItems")`:

```prisma
  @@index([sectionId])
```

5. Modelo `Grid` (líneas 423+): agregar junto a los demás atributos del final del modelo (después de los campos, antes del `}` de cierre del modelo):

```prisma
  @@index([homegridId])
```

BENEFICIOS: (1) elimina el filesort por `createdAt desc` en el listado de productos por categoría (la consulta más usada de la tienda); (2) acelera las gráficas de movimientos; (3) evita escaneos de tabla completa en páginas personalizadas.

### Paso 9.2 — Aplicar

Ejecutar EN ORDEN:

```
npx prisma generate
npx prisma db push
```

NOTA: `db push` requiere BD alcanzable. Estos índices NO pierden datos. NO usar `--accept-data-loss` manualmente (el script de build lo hace, pero acá no hace falta).

### Verificación Bloque 9

- Los comandos terminan sin error. Consultar en BD (o `npx prisma migrate diff`) que los índices existen. Navegar `/productos/<categoria>` sin regresión.

---

## BLOQUE 10 (MEDIO/BAJO) — Bundle y dependencias (solo si se quiere; NO es requisito para la lentitud de productos)

### Paso 10.1 — Code splitting con `next/dynamic`

1. `src/components/ui/ChartsWrapper.tsx` (recharts ~450KB, solo admin): NO tocar el archivo; en `src/app/admin/page.tsx:4` reemplazar el import estático por:

```tsx
import dynamic from "next/dynamic";
const ChartWrapper = dynamic(() => import("@/components/ui/ChartsWrapper"), { ssr: false });
```

(quitar el import estático `import ChartWrapper from "@/components/ui/ChartsWrapper";`).

2. `src/components/custompage/sections/DynamicIcon.tsx:1`: reemplazar `import * as LucideIcons from "lucide-react";` por imports nombrados de los iconos efectivamente usados en las páginas custom (buscar en `src/components/custompage/sections/` qué nombres de icono se configuran; si no se puede determinar la lista completa, NO cambiar este archivo y dejar nota — es la ruta `/page`, de bajo tráfico).

### Paso 10.2 — Dependencias sin uso (verificar ANTES de cada una con grep en `src/`)

Ejecutar `rg "nombre-del-paquete" src scripts prisma --stats` (o grep equivalente) y solo si da 0 coincidencias, `npm uninstall <paquete>`. Lista candidata verificada por la auditoría (0 imports en src/):

- `radix-ui` (barrel completo — SOLO después de agregar `@radix-ui/react-slot` a package.json: `npm install @radix-ui/react-slot`, porque `src/components/ui/button.tsx:2` lo importa y hoy funciona por hoisting)
- `dnd-kit` (placeholder 0.0.2 obsoleto; los reales son `@dnd-kit/*`)
- `date-fns`, `date-fns-tz`, `use-debounce`, `react-hook-form`, `@hookform/resolvers`, `slugify`, `mariadb`, `mysql2`, `@types/bcryptjs` (devDep), `ts-node` (devDep, el script "seed" de package.json apunta a `prisma/seed.ts` que NO existe — se puede dejar hasta arreglar seed aparte)

NO tocar: `recharts`, `framer-motion`, `embla-*`, `react-easy-crop`, `sonner`, `zod`, `cloudinary`, `dotenv`, `bcryptjs`, `@tanstack/react-query`, `next-auth`, `lucide-react`, `@dnd-kit/*`.

### Paso 10.3 (OPCIONAL, riesgo MEDIO) — Fuentes Google con `next/font`

FCP 2,9s medido se explica en parte por fuentes bloqueantes (`globals.css:1` con `@import url(googleapis...)`, `FuentesGoogle.tsx:38`, `escuela/page.tsx:23`). Migrar Outfit/Playfair Display/Bebas Neue a `next/font/google` en `src/app/layout.tsx` (patrón ya usado con Geist en líneas 16-24) y eliminar los `@import`. NO ejecutar este paso junto con otros; requiere verificación visual cuidadosa (las fuentes se eligen dinámicamente desde admin, por lo que hay que evaluar si conviene cargar ambas familias siempre).

### Verificación Bloque 10

- `npx tsc --noEmit`, `npm run lint`, y si se tocaron imports: `npm run build` con BD disponible.

---

## BLOQUE 11 (BAJO) — Código muerto (limpieza final, POR TANDAS)

REGLAS ANTES DE BORRAR CADA ARCHIVO: ejecutar un grep del nombre del archivo/export en TODO `src/` y confirmar 0 importadores. Borrar de a UNO y correr `npx tsc --noEmit` después de cada tanda de 3-5 archivos.

**Tanda A — seguro (0 referencias verificadas en auditoría):**
- `src/components/data/data.js`
- `src/components/auth/LoginModal.tsx`
- `src/actions/carousel/carousel-slide.actions.ts` (absorbido por `carousel.actions.ts`)
- `src/actions/admin.actions.ts` (usa modelos `turno` que NO existen en el schema — código de otro proyecto)
- `src/components/carousel/CarouselContainer.tsx`
- `src/components/admin/comunes/MarcoPaginaAdmin.tsx`
- `src/components/admin/comunes/TarjetaHub.tsx`
- `src/actions/admin-dashboard.ts`
- `src/assets/fondoropa.avif` (1,7MB, 0 referencias)
- `src/hooks/useCarousels.ts` (su único consumidor era CarouselContainer)
- En `src/lib/cache.ts`: eliminar `getCachedPageConfig` (líneas 10-15) y `getCachedCarouselLimits` (líneas 72-76) — verificar primero que NADIE los importa (`rg "getCachedPageConfig|getCachedCarouselLimits" src` debe dar 0 fuera de cache.ts).

**Tanda B — probablemente muerto (verificar grep + links de UI antes de borrar):**
- Rutas huérfanas duplicadas de sus gemelas `/admin/*` (auditoría: 0 `<Link href="/provider">` etc. en la UI): `src/app/provider/page.tsx`, `src/app/sizes/page.tsx`, `src/app/movements/page.tsx` (ATENCIÓN: esta se acaba de tocar en Bloque 5.1 — si el usuario usa la ruta, conservarla), `src/app/dashboard/`, `src/app/categories/` (renderiza UI de gestión en ruta pública — confirmar con el usuario antes de borrar).
- `src/actions/user-dashboard.ts` (sistema de "turnos" de otro proyecto, modelos inexistentes).

**Tanda C — NO borrar sin confirmación del usuario (listado solo como inventario):**
- `src/components/admin/design/**` (~1.300 líneas del sistema legacy, conectado vía `DrawerSeccionDestacada`).
- `src/app/escuela/**` (contenido demo con WhatsApp vacío).
- Schemas zod sin uso en `src/lib/zod.ts` (12 schemas): borrar SOLO los que el grep confirme con 0 referencias, y re-verificar que `garmentSchema`/`carouselWizardSlideSchema` (que sí se usan) no dependan internamente de ellos.

**Tanda D — dependencias de package.json** (ya cubierto en Paso 10.2).

### Verificación Bloque 11

- `npx tsc --noEmit` y `npm run lint` después de cada tanda. Navegación de humo por: home, `/productos`, `/productos/<categoria>`, detalle, dashboard, admin completo.

---

## VERIFICACIÓN GLOBAL FINAL (tras todos los bloques)

1. `npx tsc --noEmit` → 0 errores.
2. `npm run lint` → 0 errores.
3. Smoke test completo (rutas públicas + admin + mutaciones críticas):
   - `/` carga carruseles/destacada; `/productos` pinta inmediato y filtra rápido; `/productos/<categoria>` con paginación funcional; detalle de producto; búsqueda del header; carrito (agregar/quitar/persistir); login/admin; dashboard (tabla + edición por fila + movimientos); crear/editar/eliminar: producto, categoría, subcategoría, proveedor, talle, color, carrusel; modo mantenimiento y flags de módulos.
4. Opcional (recomendado): re-ejecutar Lighthouse y comparar contra el baseline LCP 4,6s / FCP 2,9s. Objetivo esperado: LCP < 2,5s en `/` y primeras visitas a `/productos` con grid visible sin spinner.

---

## TABLA DE HALLAZGOS DE REFERENCIA (por si hace falta re-verificar algo)

| Prioridad | Área | Archivo | Problema | Solución (bloque) |
|---|---|---|---|---|
| CRÍTICO | Imágenes | `next.config.ts:22`, `cloudinary-service.ts:29`, `ProductGrid.tsx:44` | Imágenes originales en grids; LCP 4,6s | Bloque 1 |
| CRÍTICO | Cache | `lib/cache.ts:18-26` | `getCachedProducts` passthrough; tag `products` huérfano | Bloque 2 |
| CRÍTICO | Next.js | `productos/page.tsx` | Catálogo sin SSR | Bloque 2 |
| CRÍTICO | Middleware | `middleware.ts:102-107` | Self-fetch + query BD por request | Bloque 3 |
| ALTO | Prisma | `movements.ts:59` | findMany sin límites | Bloque 5 |
| ALTO | React | `QuickViewTable.tsx:198` | N+1 de 20 server actions | Bloque 6 |
| ALTO | TS | `provider-service.ts:13` | Crear proveedor roto | Bloque 8 |
| ALTO | Cache | `general.actions.ts:5` | `getPageConfig` sin cache en cada página | Bloque 4 |
| ALTO | UI | `pagination.tsx` | Paginación rota en categoría | Bloque 8 |
| MEDIO | Prisma | `search.ts:20-78` | 4 queries secuenciales | Bloque 5 |
| MEDIO | TanStack | `QueryProvider.tsx:9-16` | Defaults + provider duplicado | Bloque 7 |
| MEDIO | React | `CartContext.tsx:58` | Value sin memo | Bloque 8 |
| MEDIO | Prisma | schema | Índices faltantes | Bloque 9 |
| BAJO | Código | ~2.900 líneas muertas | Limpieza | Bloque 11 |

---

# BLOQUE 12 — Sección destacada: título opcional y múltiples instancias

> **Contexto**: hoy `/admin/design/contenido` trata a "Sección destacada" como una sección ÚNICA y global del Home (id fijo `"featured"` en `sectionOrder`, una sola `Homegrid` por página vía `pageConfig.homegridId`, layout global en `PageConfig.featuredLayout` y título cuasi-obligatorio con defaults `"Home Destacado"` / `"CATALOGO Y SERVICIOS"`). Objetivo: convertirla en un **bloque reutilizable y múltiple**, permitiendo combinar libremente Banner + varias Secciones destacadas + Categorías + Categorías/Ubicación en el Home, cada una independiente (crear, editar, ocultar, mostrar, duplicar, eliminar, ordenar) y con **título opcional** (sin defaults ni espacios vacíos).

> **Decisiones aprobadas**: (1) **Reutilizar el modelo `Homegrid`** como instancia de Sección destacada. (2) **Mantener retrocompatibilidad** con la instancia única existente.

> **Reglas del proyecto (AGENTS.md) que aplican**: código/comentarios/UI en español; una función exportada por archivo (EXCEPTO archivos CRUD de actions, tipo serpiente); archivos ≤400 líneas; imports con `@/`; prohibido `any`; los archivos nuevos van en su carpeta de dominio. No romper secciones existentes ni el contenido configurado.

---

## 12.0 DIAGNÓSTICO (por qué es única y con título obligatorio)

| Causa | Ubicación |
|---|---|
| Id fijo `"featured"` en `sectionOrder` (una sola instancia) | `src/components/admin/diseno/contenido/normalizarSecciones.ts:28`, `src/components/admin/diseno/contenido/use-gestor-contenido.ts:155`, `src/components/admin/diseno/contenido/GestorContenido.tsx:105`, `src/components/home/HomeClient.tsx:137,173` |
| Botón "Sección destacada" se DESHABILITA si ya existe | `src/components/admin/diseno/contenido/MenuAgregarSeccion.tsx:18,75-78` |
| `pageConfig.homegridId` → sola `Homegrid`; `getPageConfig` selecciona UN único `homegrid` | `prisma/schema.prisma:345,362`, `src/actions/page-config/general.actions.ts:72` |
| Título: `updateHomeGrids` fuerza `title \|\| "Home Destacado"` al crear; `HomeSectionsDesign` pre-llena "Home Destacado" | `src/actions/page-config/home.actions.ts:81,104`, `src/components/admin/design/HomeSectionsDesign.tsx:144,170` |
| Home renderiza UN único `<ProductLayout/>` con título fijo (fallback `"CATALOGO Y SERVICIOS"`) en `<h2>` | `src/components/home/HomeClient.tsx:176`, `src/components/home/FeaturedSection.jsx:35` |

---

## 12.1 MODELO DE DATOS

**`prisma/schema.prisma`** — modelo `Homegrid`:

```prisma
model Homegrid {
  id            String       @id @default(cuid())
  tenantId      String
  title         String
  subtitle      String
  style         Int
  active        Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  columns       String       @default("md:grid-cols-2")
+  featuredLayout PageConfig_featuredLayout @default(GRID)   // NUEVA columna: layout por instancia
  grids         Grid[]
  pageConfigs   PageConfig[]

  @@index([tenantId, active])
}
```

**Notas**:
- `Homegrid.title` se mantiene como `String` (obligatorio a nivel BD), pero la UI puede guardar `""` (vacío). No se agrega valor por defecto.
- La columna `PageConfig.featuredLayout` y `PageConfig.homegridId` quedan como **retrocompat** (la instancia única existente sigue funcionando); el layout de las nuevas instancias vive en `Homegrid.featuredLayout`.

**Migración** — nuevo archivo `prisma/migrations/<timestamp>_secciones_destacadas_multiple/migration.sql`:

```sql
ALTER TABLE `Homegrid` ADD COLUMN `featuredLayout` ENUM('GRID','COLLAGE','MINIMAL') NOT NULL DEFAULT 'GRID';
```

> La build (`npm run build`) ejecuta `prisma generate && prisma db push --accept-data-loss`, así que el cliente se regenera. Si el entorno usa migraciones, aplicar la nueva migración.

---

## 12.2 ACCIONES SERVER

**Nuevo archivo** `src/actions/page-config/secciones-destacadas.actions.ts` (multi-función permitida por ser CRUD/serpiente) con:

- `crearSeccionDestacada()` → crea `Homegrid` (`tenantId`, `title: ""`, `featuredLayout: "GRID"`, `active: true`) e inserta `featured_<id>` en `sectionOrder` ANTES de la sección `location` (si existe, si no al final). Revalida tag `page-config:<tenantId>` y `revalidatePath("/")`. Retorna `{ ok, homegridId }`.
- `actualizarSeccionDestacada(homegridId, grids, title, featuredLayout)` → valida que la `Homegrid` pertenezca a la tienda activa; actualiza `Homegrid.title` tal cual (puede ser vacío, SIN default), `Homegrid.featuredLayout` (si viene), y reemplaza sus `Grid`s. Reutiliza la lógica de subida/limpieza Cloudinary (`obtenerCarpetaGrids`, `subirImagen`, `eliminarImagenes`, `obtenerPublicIdDesdeUrl`) y el `obtenerCarpetaGrids(contexto.tenantId, homegridId)`. NO depende de `pageConfig.homegridId`. Retorna `{ ok, homegridId }`.
- `alternarVisibilidadSeccionDestacada(homegridId)` → toggle `Homegrid.active`. Retorna `{ ok, activo }`.
- `duplicarSeccionDestacada(homegridId)` → clona `Homegrid` (title + " (copia)" o igual, `active: true`, mismo layout) + clona sus `Grid`s, agrega `featured_<nuevoId>` al `sectionOrder`. Retorna `{ ok, homegridId }`.
- `eliminarSeccionDestacada(homegridId)` → borra la `Homegrid` (cascade Grids), limpia imágenes Cloudinary de sus grids, y quita `featured_<id>` del `sectionOrder`. Retorna `{ ok }`.

**Refactor** `src/actions/page-config/home.actions.ts`:
- `updateHomeGrids(homegridId, grids, title)`: dejar de usar `pageConfig.homegridId` como restricción única; SIEMPRE requiere `homegridId` (una instancia concreta); guardar `title` tal cual (quitar `title || "Home Destacado"`). Queda como función retrocompat que `HomeSectionsDesign` dejará de usar (se reemplaza por `actualizarSeccionDestacada`).
- `updateSectionVisibility({ featuredLayout })`: se deja para retrocompat (layout global). Las nuevas instancias usan su propio layout.

---

## 12.3 ADMIN `/admin/design/contenido`

1. `src/components/admin/diseno/contenido/tipos-contenido.ts`:
   - `HomegridContenido` suma `active: boolean` y `featuredLayout: string | null`.
   - `ConfigContenido` suma `homegrids: HomegridContenido[]` (array). Se conservan `homegrid` y `featuredLayout` para retrocompat.

2. `src/app/admin/design/contenido/page.tsx` y `src/app/admin/design/estructura/page.tsx`:
   - Poblar `homegrids` con TODAS las `Homegrid` de la tienda (id, title, active, featuredLayout, grids) además del `homegrid`/`featuredLayout` actuales. La data sale de `getPageConfig()` de `general.actions.ts` (ver 12.4).

3. `src/components/admin/diseno/contenido/normalizarSecciones.ts`:
   - Constante de prefijo `featured_` para ids de secciones (`featured_<homegridId>`), análoga a `carousel_`.
   - `normalizarSecciones(carousels, rawOrder, homegrids?)`: migrar un `"featured"` suelto → `featured_<homegridId>` (la actual) para retrocompat; insertar las instancias activas ausentes (en la posición de `featured`, antes de `location`); mantener el orden guardado.

4. `src/components/admin/diseno/contenido/use-gestor-contenido.ts`:
   - Reemplazar `toggleSeccionFija("featured")` por `agregarSeccionDestacada()` (crea instancia y agrega `featured_<id>` al orden).
   - Agregar handlers por instancia: `editarSeccionDestacada(homegridId)`, `duplicarDestacada(homegridId)`, `alternarVisibilidadDestacada(homegridId)`, `eliminarDestacada(homegridId)`.
   - `filas` contempla `featured_<id>`.

5. `src/components/admin/diseno/contenido/GestorContenido.tsx`:
   - `resolverFila("featured_<id>")`: buscar la instancia en `config.homegrids`; mostrar título real (o "Sección destacada" si vacío) y `${n} tarjetas` / "Sin configurar"; acciones: editar, duplicar, ocultar/mostrar, eliminar (igual que con carruseles). El `alEditar` abre `DrawerSeccionDestacada` con `homegridId`.
   - Secciones ocultas: listar las instancias con `active === false` en el bloque "Secciones ocultas".

6. `src/components/admin/diseno/contenido/MenuAgregarSeccion.tsx`:
   - Quitar el flag `deshabilitado` de "Sección destacada" (siempre disponible; cada clic crea una nueva instancia). Quitar `destacadaAgregada` del componente (o dejarlo sin uso en la firma).

7. `src/components/admin/diseno/contenido/DrawerSeccionDestacada.tsx`:
   - Aceptar `homegridId: string | null`; resolver la instancia en `config.homegrids` y pasarla a `HomeSectionsDesign` como `homegrid` (instancia) + `featuredLayout` de esa instancia.

8. `src/components/admin/design/HomeSectionsDesign.tsx`:
   - Cambiar props: en vez de `config.homegrid` (único) usar una instancia específica `{ id, title, grids }` + su `featuredLayout`. Inicializar el título con `homegrid?.title ?? ""` (SIN default). Al guardar llamar a `actualizarSeccionDestacada(id, grids, title, layout)` (nueva action), sin forzar título.

9. `src/components/admin/diseno/estructura/EditorEstructura.tsx`, `src/components/admin/diseno/BloqueContenido.tsx` y `src/components/admin/diseno/ResumenDiseno.tsx`:
   - Contemplar `featured_<id>` en `resolverFila`; `BloqueContenido`/`ResumenDiseno` muestran el TOTAL de tarjetas sumando todas las instancias (o el número de instancias) en lugar de `homegrid?.grids.length`.

---

## 12.4 HOME PÚBLICO

1. `src/actions/page-config/general.actions.ts`:
   - Además del `homegrid` (único, retrocompat), devolver `homegrids`: todas las `Homegrid` de la tienda con `id`, `title`, `active`, `featuredLayout`, `columns` y sus `grids` ordenados. Exponerlo en el objeto `pageConfig`.

2. `src/components/home/HomeClient.tsx`:
   - Para un id `featured_<id>`: buscar la instancia en la lista `homegrids`; si `active`, renderizar `<FeaturedSection homegrid={instancia} />`. `getSubtype("featured_<id>")` devuelve el `featuredLayout` de esa instancia. Si la instancia no está activa, no renderizarla.
   - Para el `"featured"` suelto (retrocompat): resolver a la `homegrid` única (`config.homegrid`).
   - Sacar el `case "featured": return <ProductLayout />` global y reemplazarlo por el render de instancia.

3. `src/components/home/FeaturedSection.jsx`:
   - Aceptar la instancia por props (`{ homegrid }`): `const layout = homegrid?.featuredLayout?.toLowerCase() || "grid"`; `const categories = (homegrid?.grids || []).map(mapGridToCard)`.
   - Renderizar el `<h2>` SOLO si `homegrid?.title` no está vacío (sin fallback "CATALOGO Y SERVICIOS"). `return null` si no hay grids (una instancia recién creada no aparece hasta configurarse).

4. `src/components/providers/products/layouts/ProductLayout.jsx`:
   - Pasa a ser opcional/retrocompat; si se sigue usando, aceptar la instancia por prop y delegar a `FeaturedSection`. La fuente de verdad para las instancias es `HomeClient`.

---

## 12.5 VERIFICACIÓN (checklist del usuario)

- [ ] Crear Sección destacada SIN título → guarda y persiste correctamente (sin default "Home Destacado").
- [ ] Verla en el Home → aparece SIN bloque de título (sin espacio vacío).
- [ ] Crear una 2ª Sección destacada → ambas coexisten.
- [ ] Crear una 3ª → también coexisten (3 instancias independientes).
- [ ] Editar una → NO modifica las demás.
- [ ] Cambiar el orden → se respeta en el Home (DnD).
- [ ] Ocultar una → se oculta SOLO esa instancia (bloque "Secciones ocultas").
- [ ] Volver a mostrarla → vuelve a aparecer correctamente.
- [ ] Eliminar una → NO afecta las demás.
- [ ] Duplicar una → crea una copia independiente.
- [ ] Home con mix Banner + destacada con título + destacada sin título + Categorías + otra destacada → orden respetado.

## 12.6 COMANDOS DE VERIFICACIÓN

```
npm run lint
npm run build   (regenera cliente Prisma + db push)
```

**Flujo de trabajo (según AGENTS.md)**: subagentes en paralelo — (A) modelo+acciones, (B) UI admin contenido, (C) home público — y luego un agente VERIFICADOR global que revise TODO lo producido, detecte violaciones de reglas (idioma, ≤400 líneas, una export, imports `@/`, sin `any`) y las repare. Su aprobación cierra el bloque.
