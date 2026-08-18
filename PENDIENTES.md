# PENDIENTES

## Error en tarjetas de la home — `<Link>` con múltiples hijos y URL recursiva

### Síntoma
Al cargar `/` en dev se lanza:

```
Error: Multiple children were passed to <Link> with `href` of `/productos?categoria=%2Fproductos%3Fcategoria%3D...` but only one child is supported
```

Trace: `CardsLayoutSimple` → `CardsLayout` → `renderCarousel` → `renderSection` → `renderWithMt` → `HomeClient` → `HomePage`.

### Causas
1. **Crash (directa):** en `src/components/carousel/layouts/cards/CardsLayoutSimple.tsx:45-51` el `<Link>` usa `legacyBehavior` + `passHref` y envuelve 3 hijos (fondo, overlay, texto). Con `legacyBehavior`, Next.js 15 ejecuta `React.Children.only(children)` (`node_modules/next/dist/client/link.js:228`) y lanza el error si hay más de un hijo.
2. **URL recursiva:** el campo `url` de `CarouselSlide` quedó guardado de forma recursiva (`/productos?categoria=%2Fproductos%3Fcategoria%3D...`, varias capas). `resolverEnlaceGuardado` vuelve a pasar por `encodeURIComponent` valores que ya contienen el prefijo `/productos?categoria=`; `resolverEnlaceSlide` los devuelve tal cual (empiezan con `/`); y `SlideEditor` hace un solo `decodeURIComponent` que deja el prefijo dentro del valor. Resultado: cada guardado re-encodifica y el enlace navega a `/productos` sin resultados.

### Plan de solución
1. **`CardsLayoutSimple.tsx`** — eliminar `passHref` y `legacyBehavior` del `<Link>` (el `<Link>` moderno acepta múltiples hijos y propaga `className`/`style` al `<a>`).
2. **Nuevo `src/helpers/normalizarValorEnlace.ts`** — extrae el valor crudo de `/productos?categoria=` y `/productos/item/`, aplicando `decodeURIComponent` repetido hasta estabilizar. Una sola función exportada.
3. **`src/helpers/enlaceSlide.ts`** — usar el normalizador: detectar prefijo `categoria`/`item` (o `config.linkType`) y reconstruir siempre un enlace limpio de una sola codificación. Beneficia a hero/banner que usan el mismo resolver.
4. **`src/helpers/resolverEnlaceGuardado.ts`** — normalizar el destino antes de encodificar para que guardar jamás re-encodifique una URL ya resuelta.
5. **`src/components/admin/carousel/SlideEditor.tsx`** — reemplazar el `decodeURIComponent` suelto (líneas 95-98) por `normalizarValorEnlace`.
6. **(Opcional)** `scripts/limpiar-enlaces-carrusel.ts` — recorrer `CarouselSlide`, normalizar `url` y actualizar vía Prisma (sanear DB). El punto 3 ya normaliza en render, por lo que la navegación queda correcta sin este paso.
7. **Verificación** — `npm run lint`, `npx tsc --noEmit` y cargar `/` en dev.

---

## La tipografía cambiada en Diseño no se aplica en el home (vista del cliente)

### Síntoma
Al cambiar la fuente principal/secundaria en `/admin/design/apariencia/tipografia`, el cambio se percibe en admin (preview local con estilo inline y vista previa en iframe), pero los elementos del home siguen con las fuentes anteriores. Afecta también a colores/identidad por el mismo mecanismo de datos obsoletos.

### Causas
1. **Config obsoleta al navegar (principal):** el layout raíz (`src/app/layout.tsx`) obtiene `pageConfig` una sola vez por carga completa. En navegación cliente (admin → home con `Link href="/"`) el layout raíz NO se re-ejecuta, por lo que el `PageConfigProvider` raíz queda con datos viejos. `EstilosApariencia` (`src/components/apariencia/EstilosApariencia.tsx`) es quien aplica `--fuente-principal` / `--fuente-secundaria` y carga las fuentes de Google, y lee ese provider obsoleto → el home conserva las fuentes viejas (y si el efecto se re-ejecuta, las revierte).
2. **Sin refresco tras guardar:** `SeccionTipografia.tsx`, `SeccionColores.tsx` y `SeccionIdentidad.tsx` (`src/components/admin/diseno/apariencia/`) persisten en BD vía `updateBrandingConfig` pero no llaman `router.refresh()` ni actualizan las variables en el documento.
3. **Override `font-sans`:** `ProductLayout.jsx:57` (sección de productos del home) y `escuela/page.tsx:15` usan la clase Tailwind `font-sans`, que impone la pila sans por defecto y pisa la fuente de marca aunque las variables estén correctas.
4. **Fuentes no aplicadas en SSR:** `obtenerVariablesTema` (`src/lib/apariencia/obtener-variables-tema.ts`) solo devuelve colores; el inline style del `<html>` no incluye las fuentes, que se aplican recién tras hidratación.

### Plan de solución
1. **Nueva helper** `src/lib/apariencia/aplicar-tipografia-documento.ts` — una función exportada `aplicarTipografiaDocumento(principal, secundaria)`: setea `--fuente-principal` / `--fuente-secundaria` en `document.documentElement` y administra la carga/limpieza de los `<link>` de Google Fonts (lógica movida desde `EstilosApariencia`).
2. **Fuentes en SSR** — extender `src/lib/apariencia/obtener-variables-tema.ts` con `--fuente-principal` (default `'Outfit', sans-serif`) y `--fuente-secundaria` (default `'Playfair Display', serif`), para que el layout raíz las pinte inline desde el servidor.
3. **Auto-actualización al navegar** — refactor de `src/components/apariencia/EstilosApariencia.tsx`: usar la helper y re-consultar `getPageConfig` (`@/actions/page-config/general.actions`) en cada cambio de `usePathname()`, aplicando variables frescas (fuentes y colores) aunque el layout raíz persista.
4. **Refresco tras guardar en admin:**
   - `SeccionTipografia.tsx`: tras éxito → `router.refresh()` + `aplicarTipografiaDocumento(...)` para aplicar al instante.
   - `SeccionColores.tsx` y `SeccionIdentidad.tsx`: tras éxito → `router.refresh()`.
5. **Quitar overrides del home:**
   - `src/app/globals.css`: agregar `@theme { --font-sans: var(--fuente-principal, 'Outfit'), ui-sans-serif, system-ui, sans-serif; }` para que toda clase `font-sans` use la fuente de marca.
   - `src/components/providers/products/layouts/ProductLayout.jsx`: quitar `font-sans` del div raíz.
6. **Ejecución** — subagente A (puntos 1–3, infraestructura compartida); subagentes B (punto 4, archivos admin) y C (punto 5) en paralelo definiendo de antemano la firma de la helper; agente verificador final (reglas AGENTS.md: una función exportada por archivo, ≤400 líneas, imports `@/`, español) + `npm run lint`.

---

## Acordeón de categorías navega al expandir — pantalla de selección de productos

### Síntoma
En `/productos` (catálogo completo), al hacer clic en el encabezado de una categoría del acordeón del sidebar, el sistema navega/carga automáticamente todos los productos de esa categoría. Abrir una categoría no debería ejecutar ninguna navegación: solo debe expandirse para mostrar sus subcategorías.

### Causas
1. **Navegación al abrir (principal):** en `src/components/providers/products/views/ProductsPage.tsx:172` el botón encabezado de cada categoría ejecuta `handleCategoryClick(cat)` (líneas 100-102), que llama a `onFilterChange?.(cat.name)`.
2. **El callback navega:** `CatalogoClient.tsx:50-55` recibe ese filtro y ejecuta `updateParams({ categoria })` → `router.replace("/productos?...")`, disparando la navegación y recarga de productos con solo abrir el acordeón.
3. **La apertura visual es un efecto secundario:** el `useEffect` de `ProductsPage.tsx:41-57` detecta el nuevo `categoriaParam` en la URL y setea `openCategoryId`, dando la impresión de que "abrir navega". En realidad la navegación ocurre primero.

### Plan de solución
1. **`src/components/providers/products/views/ProductsPage.tsx`** — separar las dos acciones:
   - Encabezado del acordeón (línea 172): reemplazar `onClick={() => handleCategoryClick(cat)}` por un toggle local `onClick={() => setOpenCategoryId(isOpen ? null : cat.id)}` que solo expanda/contraiga, sin tocar la URL ni `onFilterChange`.
   - Eliminar `handleCategoryClick` (líneas 100-102) por quedar sin uso.
   - Mantener la navegación solo en las opciones (ya correcto): "• Todo {cat.name}" (línea 197) y subcategorías (línea 211) sí llaman a `onFilterChange`; "Todos los productos" (línea 152) limpia los filtros.
2. **Resultado esperado** — clic en el encabezado = expandir/contraer mostrando subcategorías; clic en una opción/subcategoría = navegar a la vista de productos. Se conserva el acordeón de apertura única (un solo `openCategoryId`).
3. **Verificación** — `npm run lint`, `npx tsc --noEmit` y probar en `/productos`: abrir/cerrar categorías sin navegación y confirmar que seleccionar subcategoría sí filtra.

---

## Implementar vista y lógica del modo mantenimiento

### Estado actual
El toggle de mantenimiento **ya existe y funciona** en `/admin/pageConfig` (grupo "Sistema" → "Mantenimiento"): `SeccionMantenimiento.tsx` persiste `maintenanceMode` vía `updatePageFlags` (`src/actions/page-config/flags.actions.ts`), que ya revalida `page-config` y `/`. El campo `maintenanceMode` ya está en `PageConfig` (prisma), en `getPageConfig` (`general.actions.ts`) y en los tipos `ConfigCompleta`/`ConfigAjustes`. **Falta el lado público**: la pantalla de mantenimiento y la lógica centralizada que bloquee el sitio.

### Comportamiento esperado
- Con mantenimiento **ACTIVADO**, los usuarios del sitio público (anónimos y rol `USER`) ven una pantalla de mantenimiento en lugar de la tienda. Los admins logueados pueden previsualizar la tienda.
- **No se bloquea**: `/login`, `/register`, `/admin/*`, `/dashboard`, `/provider`, `/sizes`, `/movements`, `/api/*` (incluye `/api/auth` y las APIs de admin). Sin loops de redirección.
- Con mantenimiento **DESACTIVADO**, el sitio funciona exactamente igual que hoy.

### Mecanismo elegido
- **API interna + fetch**: nueva ruta `GET /api/mantenimiento` (Node) que lee `maintenanceMode`. El middleware (Edge runtime, no compatible con Prisma/MariaDB) la consulta y, si está activo, redirige a `/mantenimiento`.
- **Bypass solo para rol ADMIN**.
- **Fail-open**: si la consulta al estado falla, el sitio sigue funcionando normal (evita lockouts).

### Plan de solución
1. **Nuevo `src/app/api/mantenimiento/route.ts`** — GET → `{ activo: boolean }` consultando `prisma.pageConfig.findUnique({ where: { id: 1 }, select: { maintenanceMode } })`. Con `export const dynamic = "force-dynamic"` para no cachear en build. Error de BD → `{ activo: false }` con 500.
2. **Nuevo `src/lib/mantenimiento/consultar-mantenimiento.ts`** — helper Edge-safe (solo `fetch`), una función exportada `consultarMantenimientoActivo(origin: string): Promise<boolean>`: fetch a `${origin}/api/mantenimiento`, devuelve `data.activo === true`, y `false` ante cualquier error.
3. **`src/middleware.ts`** — agregar la rama de mantenimiento sin tocar la lógica existente de auth/admin/login: bandera `esRutaPublica` (excluye `/api/*`, `/login`, `/register`, `/admin/*`, gestion y `/mantenimiento`); si es pública, `await consultarMantenimientoActivo(nextUrl.origin)` y `userRole !== "ADMIN"` → `NextResponse.redirect(new URL("/mantenimiento", nextUrl))`, justo antes del `return NextResponse.next()` final. Extender el matcher de assets estáticos a `.*\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$`.
4. **Nuevo `src/components/mantenimiento/PantallaMantenimiento.tsx`** — componente server (una función exportada) con la estética actual (tokens CSS `--color-fondo-sitio`, `--color-primario`, `--fuente-principal/secundaria`): fondo a color de marca + luces neón difusas (estilo `AuthLayout`), logo de la tienda o ícono `Wrench` en círculo, título "Página en mantenimiento" en mayúsculas cursiva con alternancia de color, mensaje "Estamos trabajando para mejorar tu experiencia. Volvé pronto.", badge de estado y enlace sutil "¿Sos administrador? Iniciar sesión" → `/login`.
5. **Nuevo `src/app/mantenimiento/page.tsx`** — server component que obtiene `getPageConfig()` (storeName, logo, contacto) y renderiza `PantallaMantenimiento`.
6. **`src/components/layout/LayoutComponent.tsx`** — ocultar `Header` y `CartSidebar` cuando `pathname === "/mantenimiento"` (pantalla limpia).
7. **`src/components/layout/AppGate.tsx`** — en `/mantenimiento`, ocultar footer y modales legales/cookies.
8. **Sin cambios** — auth (`auth.ts`, `auth.config.ts`), estructura del panel y el toggle existente.
9. **Ejecución** — subagentes en paralelo: A (puntos 1–3, infraestructura; define contratos `/api/mantenimiento` → `{activo}` y ruta `/mantenimiento`), B (puntos 4–5, pantalla), C (puntos 6–7, ocultar chrome); agente verificador final (reglas AGENTS.md: una función exportada por archivo, ≤400 líneas, imports `@/`, español) + `npm run lint` + `npx tsc --noEmit`.
10. **Prueba manual** — activar toggle en `/admin/pageConfig` → visitar `/` y `/productos` anónimo (pantalla de mantenimiento), verificar que `/login` y `/admin/pageConfig` acceden sin loop, desactivar → tienda normal.

---

## Corregir cierre del carrito lateral/modal

### Síntoma
El carrito lateral (`CartSidebar`) **solo se puede cerrar haciendo click en la X**. No hay overlay ni área exterior que permita cerrarlo, y no existe ningún mecanismo de propagación de eventos para distinguir clicks dentro vs. fuera del panel.

### Comportamiento esperado
- Al abrir el carrito, debe aparecer un overlay/fondo alrededor del panel.
- Click **sobre el área exterior al carrito** → el carrito se cierra.
- Click **dentro del carrito** → se mantiene abierto (botones, productos, cantidad, eliminar, etc.).
- La **X sigue funcionando** como hasta ahora.
- Implementación con manejo correcto del evento del overlay, usando `stopPropagation` o sistema equivalente:

```text
Click en overlay → cerrar carrito
Click dentro del carrito → mantener abierto
Click en X → cerrar carrito
```

### Causas
1. **Sin overlay (principal):** `src/components/cart/CartSidebar.tsx` renderiza únicamente el panel deslizante (`motion.div` fijo a la derecha), sin ningún backdrop detrás. No hay elemento que capture el click exterior, por lo que el único cierre posible es el botón X (línea 61).
2. **Sin control de propagación:** el panel no tiene `stopPropagation`, por lo que no existe distinción entre click dentro y fuera del carrito.

### Plan de solución
1. **`src/components/cart/CartSidebar.tsx`** (único archivo a tocar; sin cambios de diseño ni funcionalidad):
   - Envolver el panel dentro de un nuevo `motion.div` overlay: `fixed inset-0`, `z-[100]`, fondo semitransparente (`rgba(0,0,0,0.5)`), con `initial/animate/exit` de `opacity` (fade) y `onClick={onClose}`.
   - Cambiar el `motion.div` del panel de `fixed` a `absolute right-0 top-0 h-full w-full sm:w-[400px]` (posicionado dentro del overlay), manteniendo `z-[101]`, estilos, animación `x: "100%"` → `0` y todo su contenido intacto.
   - Agregar `onClick={(e) => e.stopPropagation()}` al contenedor del panel para que ningún click interno llegue al overlay.
   - La X (línea 61) queda igual: `onClick={onClose}` (ya cubierta por el `stopPropagation` del contenedor).
   - Ambos `motion.div` dentro del mismo `AnimatePresence`, para que el cierre anime overlay + panel juntos.
2. **Resultado esperado** — click en overlay cierra; click dentro mantiene abierto; X cierra. En móvil (`w-full`) no hay área exterior visible: comportamiento existente que se conserva.
3. **Verificación** — `npm run lint`, `npx tsc --noEmit` y prueba manual: abrir carrito, click fuera (cierra), click en X (cierra), y operar dentro del carrito (cantidad, eliminar, especificaciones) sin que se cierre.
