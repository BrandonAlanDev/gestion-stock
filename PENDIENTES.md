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

---

## Módulos desacoplables del ecommerce: Escuela, Arreglos y Personalizado

### Objetivo
Las tres funcionalidades (`escuelaEnabled`, `arreglosEnabled`, `personalizadoEnabled` en `PageConfig`) deben comportarse como **módulos opcionales del ecommerce**. Cuando una flag es `false`, el módulo debe comportarse como si no existiera: sin links, botones, cards, secciones, componentes, rutas públicas/internas, ni acceso por URL directa. Cuando es `true`, funciona exactamente como hoy. No se agrega ningún sector nuevo en admin: los módulos responden únicamente a la base de datos (0/1).

### Estado actual (relevado)
- **Flags en BD:** `prisma/schema.prisma:235-237` con `@default(true)`; la migración `20260715030342.../migration.sql:211-213` con `DEFAULT true`. Hoy el default es `true` (indeseado).
- **Rutas:** `/escuela` (server, sin guarda), `/arreglos` (client, sin guarda), `/personalizado` (client, guarda client que redirige a `/`), `/admin/personalizado` (server, guarda que redirige a `/`).
- **Referencias UI:** `Searchbarfinder.tsx:70-75` (links `/escuela` y `/personalizado` según flag); `ContenidoSidebar.tsx:53-57` (link admin "Personalizado", fallback `true` sin config); `BloquePaginas.tsx:66-92` (listado admin de páginas); `admin/pageConfig/page.tsx:52-54` (fallbacks `?? true`).
- **Acciones del módulo personalizado sin guardas:** `board-options.ts` (`getBoardOptions`), `custom-boards.ts` (`createCustomBoard`, `getCustomBoards`), `admin-personalizado.ts` (CRUDs).
- **Patrón existente a replicar:** el middleware ya consulta `/api/mantenimiento` vía fetch (`consultarMantenimientoActivo`), patrón válido para Edge runtime.

### Decisiones tomadas
- **Destino del bloqueo:** página 404. Las guardas server usan `notFound()` (renderiza `src/app/not-found.tsx`); el middleware redirige a `/404`. Las guardas client existentes pasan de redirigir a `/` a `/404`.
- **Migración:** solo cambia el `DEFAULT` a `false`. La fila actual (id=1) conserva sus valores; las bases nuevas nacen con los tres módulos desactivados.
- **Fail-closed:** si no hay config o falla la consulta, el módulo se considera desactivado.

### Plan de solución
1. **Base de datos:**
   - `prisma/schema.prisma:235-237` — `@default(true)` → `@default(false)` en `arreglosEnabled`, `escuelaEnabled`, `personalizadoEnabled`.
   - Generar migración `npx prisma migrate dev --name modulos_desactivados_por_defecto` (MySQL: `ALTER TABLE PageConfig ALTER COLUMN ... SET DEFAULT false`).
2. **Infraestructura de guardas:**
   - Nuevo `src/lib/modulos/modulo-habilitado.ts` — `moduloHabilitado(clave: "escuelaEnabled" | "arreglosEnabled" | "personalizadoEnabled"): Promise<boolean>` → `config?.[clave] === true`.
   - Nuevo `src/lib/modulos/verificar-modulo.ts` — `verificarModuloHabilitado(clave)`: si el módulo está desactivado lanza `notFound()`.
   - Nuevo `src/app/api/paginas-config/route.ts` — `GET` `force-dynamic` → `{ escuelaEnabled, arreglosEnabled, personalizadoEnabled }`; error → `false` en todo.
   - Nuevo `src/lib/modulos/consultar-modulos.ts` — `consultarModulosActivos(origin)`: fetch a `/api/paginas-config` (`cache: "no-store"`), replicando `consultarMantenimientoActivo`.
   - `src/middleware.ts` — mapa `RUTAS_MODULOS = { "/escuela": "escuelaEnabled", "/arreglos": "arreglosEnabled", "/personalizado": "personalizadoEnabled", "/admin/personalizado": "personalizadoEnabled" }` (exacto o trailing slash). Si la flag da `false` → `NextResponse.redirect(new URL("/404", nextUrl))`. Aplica a admin y público por igual.
3. **Guardas por página:**
   - `src/app/escuela/page.tsx` — `await verificarModuloHabilitado("escuelaEnabled")`.
   - Nuevo `src/app/arreglos/layout.tsx` — guarda `arreglosEnabled`.
   - Nuevo `src/app/personalizado/layout.tsx` — guarda `personalizadoEnabled`.
   - `src/app/personalizado/page.tsx:115-118` — guarda client: `router.replace("/")` → `router.replace("/404")`.
   - `src/app/admin/personalizado/page.tsx:22-24` — `redirect("/")` → `redirect("/404")`.
4. **Ocultar referencias en UI:**
   - `src/components/home/Searchbarfinder.tsx:70-75` — comparación estricta `=== true` en escuela y personalizado.
   - `src/components/layout/ContenidoSidebar.tsx:56` — fallback `: true` → `: false`.
   - `src/app/admin/pageConfig/page.tsx:52-54` — `?? true` → `?? false`.
   - `src/components/admin/diseno/BloquePaginas.tsx` — renderizar las filas Escuela/Arreglos/Personalizado solo si su flag está activa.
   - Se conservan los toggles admin existentes (`SeccionPaginasSitio`, `PanelConfiguracion`), que siguen siendo el punto de control de la BD.
5. **Guardas en acciones/servicios:**
   - `src/actions/board-options.ts` — `getBoardOptions` retorna datos vacíos si está desactivado.
   - `src/actions/custom-boards.ts` — `createCustomBoard` retorna `{ error: "..." }` y `getCustomBoards` retorna `[]`.
   - `src/actions/admin-personalizado.ts` — guarda vía `moduloHabilitado("personalizadoEnabled")` en `getBoardAdminOptions` y los CRUDs (return error temprano).
6. **Ejecución y verificación:**
   - Subagentes en paralelo con interfaces predefinidas: A (fases 1–2, infraestructura), B (fase 3, páginas/layouts), C (fases 4–5, UI + acciones).
   - Agente verificador final (reglas AGENTS.md: una función exportada por archivo, ≤400 líneas, imports `@/`, español, sin `any`).
   - Comandos: `npx tsc --noEmit`, `npm run lint`, `npx prisma migrate dev`.

### Fuera de alcance (se conservan intactos)
- Toggles admin existentes (`SeccionPaginasSitio`, `PanelConfiguracion`).
- Ecommerce tradicional (`/productos`, carrito, catálogo, home, admin de productos, etc.).
- El dato mock `heroSlides` de `data.js` (código muerto, no referenciado).

---

## Correcciones y mejoras de UX — carruseles, contenido oculto, navbar, plan de ahorro, feedback visual y apariencia

### Alcance (7 puntos)
1. Carruseles: permitir slides sin link sin romper la edición posterior.
2. Contenido (`/admin/design/contenido`): listar y recuperar elementos ocultos (no eliminarlos).
3. Navbar: "Catálogo" siempre visible, sin abrir el menú.
4. "Plan de ahorro": gating correcto reutilizando el sistema de flags existente.
5. Feedback visual en todos los elementos interactivos (cursor-pointer, hover, active, disabled).
6. Vista Productos: indicador visual de desplegable en el selector de ordenamiento.
7. Apariencia: Tipografía y Estilo pasan de autosave a guardado manual (como Colores/Identidad).

### Estado actual (relevado)
1. **Carruseles:** el link es opcional en BD (`CarouselSlide.url String?`) y el render público ya maneja slides sin link (`HeroCtaButton`: `if (!url) return null`). El error surge al EDITAR: `use-gestor-contenido.ts:285` y `CarouselWizard.tsx:81` reconstruyen `linkType: ""` para slides sin link, y `carouselWizardSlideSchema` (`src/lib/zod.ts:239`) rechaza `""` porque `.default("NONE")` solo aplica a `undefined`. Mensaje: `Invalid option: expected one of "NONE"|...`. Mismo bug latente en `addCarouselSlide`/`updateCarouselSlide` (mismo schema).
2. **Contenido:** "Ocultar" carrusel = UPDATE `Carousel.active=false` (no borra), pero `normalizarSecciones.ts:99` (`if (c.active === false) continue;`) excluye de la lista admin a los carruseles ocultos cuyo id no esté en `sectionOrder`. "Ocultar" destacada/ubicación = quitar el id de `PageConfig.sectionOrder` y la fila desaparece de la lista; solo recuperable por el menú "Agregar sección" (poco visible). El borrado físico (`deleteCarousel`) es funcionalidad separada con confirmación y debe conservarse.
3. **Navbar:** `Header.tsx:14-17` tiene `enlacesUsuario` (Catálogo + Plan Ahorro) renderizados SOLO dentro del desplegable de la hamburguesa (`isSidebarOpen`, líneas 148-198). No hay menú horizontal; el catálogo no es accesible sin abrir el menú en desktop ni mobile.
4. **Plan de ahorro:** `/plan-de-ahorro/page.tsx` es cliente puro sin validación de flag; no está en `RUTAS_MODULOS` del middleware; el enlace del Header está hardcodeado sin filtrar. El sistema de flags existente (`escuelaEnabled`, `arreglosEnabled`, `personalizadoEnabled` en `PageConfig`, helpers `moduloHabilitado`/`verificarModuloHabilitado`/`consultarModulosActivos`, admin en Configuración → "Páginas del sitio" → `SeccionPaginasSitio` → `updatePageFlags`) no tiene flag para plan de ahorro.
5. **Feedback visual:** no existe regla global de cursor (ni en `globals.css` ni en el preflight de Tailwind v4); los `<button>` crudos sin `cursor-pointer` muestran cursor flecha. `button.tsx` sí incluye cursor-pointer+hover+active, pero decenas de botones no lo usan. Bug adicional: `src/components/ui/pagination.tsx:16,24` usa `className="..."` literal (botones sin estilo).
6. **Productos:** el `<select>` de ordenamiento (`ProductsPage.tsx:125-137`) usa `appearance-none` sin chevron → parece un botón común. Mismo defecto en `CategoryFilter.tsx:35-43` y `MovementModal.tsx:157-158`. El acordeón de categorías sí tiene chevron pero sus botones carecen de `cursor-pointer`.
7. **Apariencia:** `SeccionTipografia.tsx` y `SeccionEstilo.tsx` guardan en cada `onChange`/`alCambiar` (`guardar(nuevas)` líneas 52-62 y 87-121) sin botón Guardar; `SeccionColores.tsx` y `SeccionIdentidad.tsx` ya usan el patrón manual (estado local + snapshot `base` + botón Guardar + toast + `router.refresh()`). La server action `updateBrandingConfig` ya soporta todos los campos; no hay cambios de BD.

### Decisiones tomadas
- **Carruseles:** el link queda OPCIONAL (estado válido, igual que hoy en BD y render). Se normaliza `""`/`undefined` → `"NONE"` en una ÚNICA regla (schema zod) para crear y editar, más normalización client-side para que el estado del wizard siempre sea válido.
- **Plan de ahorro:** nuevo flag `planAhorroEnabled` en el MISMO sistema de flags (sin lógica paralela). **Default `false`** (confirmado por el usuario); se activa desde Configuración → Páginas del sitio.
- **Elementos ocultos en Contenido:** grupo separado "Secciones ocultas" al final de la lista (confirmado por el usuario), fuera del SortableContext, con badge "Oculto" y botón "Mostrar".
- **Bloqueo de plan de ahorro:** 404 (mismo patrón que escuela/arreglos: `notFound()` en layout server + middleware → `/404`).

### Plan de solución

**1. Carruseles — slides sin link**
- `src/lib/zod.ts` — en `carouselWizardSlideSchema.linkType` (línea 239) y `carouselSlideSchema.linkType` (línea 213): `z.preprocess((v) => (v === "" || v === null ? undefined : v), z.enum([...]).optional().default("NONE"))` para que el default aplique siempre. Cubre create/update/addSlide/updateSlide con una sola regla.
- `src/components/admin/diseno/contenido/use-gestor-contenido.ts:285` — `linkType: (s.config?.linkType as string) || "NONE"`.
- `src/components/admin/carousel/CarouselWizard.tsx:81` — idem (`|| "NONE"`).

**2. Contenido — recuperar ocultos**
- `src/components/admin/diseno/contenido/normalizarSecciones.ts:98-104` — quitar `if (c.active === false) continue;` para incluir todos los carruseles (activos e inactivos) en el orden. El sitio público ya filtra por `active` (`HomeClient.tsx:116,155-182`), sin impacto visual.
- `src/components/admin/diseno/contenido/GestorContenido.tsx` — renderizar siempre `featured` y `location`: si no están en `filas`, mostrarlas en un grupo separado "Secciones ocultas" al final (fuera del `SortableContext`), con badge "Oculto" y botón "Mostrar" (`toggleSeccionFija` existente). Ajustar la condición del `EstadoVacio` para considerar el grupo.
- Sin cambios de BD: "Ocultar" sigue siendo UPDATE de `active` (carruseles) o edición de `sectionOrder` (destacada/ubicación). El borrado físico permanece separado con su confirmación.

**3. Navbar — catálogo siempre visible**
- `src/components/layout/Header.tsx` — agregar link "Catálogo" (ícono `Store` + label, label `hidden sm:inline` como los demás botones) en la barra superior (línea ~100), visible en desktop y mobile sin abrir el menú; quitar "Catálogo" de `enlacesUsuario` (queda solo "Plan Ahorro", gated por flag). Resto de la estructura intacta.

**4. Plan de ahorro — gating con flags existentes**
- `prisma/schema.prisma` — agregar `planAhorroEnabled Boolean @default(false)` a `PageConfig` + migración (`npx prisma migrate dev --name plan_ahorro_flag`).
- `src/lib/modulos/modulo-habilitado.ts` — agregar `"planAhorroEnabled"` a `ClaveModulo`.
- `src/lib/modulos/consultar-modulos.ts` y `src/app/api/paginas-config/route.ts` — incluir el flag (tipos + select + respuesta).
- `src/middleware.ts` — `RUTAS_MODULOS` + `"/plan-de-ahorro": "planAhorroEnabled"` (y el tipo del Record).
- Nuevo `src/app/plan-de-ahorro/layout.tsx` — `await verificarModuloHabilitado("planAhorroEnabled")` (patrón `arreglos/layout.tsx`).
- Admin: `src/components/admin/diseno/ajustes/SeccionPaginasSitio.tsx` (switch "Plan de ahorro"), `tipos-ajustes.ts`, `DrawersConfiguracion.tsx` (`aConfigAjustes`), `tipos-configuracion.ts`, `src/app/admin/pageConfig/page.tsx` (mapping `?? false`).
- `src/lib/zod.ts` `flagsPaginaSchema` — agregar `planAhorroEnabled: z.boolean().optional()`.
- `src/actions/page-config/general.actions.ts` — agregar `planAhorroEnabled: true` al select (llega al `PageConfigProvider` → Header).
- `Header.tsx` — filtrar "Plan Ahorro" por `pageConfig?.pageConfig?.planAhorroEnabled === true`.
- `src/components/admin/diseno/BloquePaginas.tsx` — fila "Plan de ahorro" cuando el flag esté activo (consistencia con el resumen de Diseño).

**5. Feedback visual**
- `src/app/globals.css` (BASE STYLES) — regla global mínima: `button:not(:disabled), [role="button"]:not(:disabled), select:not(:disabled) { cursor: pointer; }` y `button:disabled, select:disabled { cursor: not-allowed; }` (cubre todos los `<button>` crudos de una vez).
- `cursor-pointer` + hover/active puntuales en: hamburguesa y carrito (`Header.tsx`), cerrar carrito (`CartSidebar.tsx`), acordeón de categorías y "Limpiar filtros" (`ProductsPage.tsx`), acordeones FAQ (`FaqSection.tsx`, `plan-de-ahorro/page.tsx`), `switch.tsx`, `selector-segmentado.tsx`, `confirm-dialog.tsx`, `sheet.tsx`, `FilaSeccion.tsx` (`estiloBotonAccion`), `ItemConfiguracion.tsx`, presets de `color-picker.tsx`, limpiar búsqueda (`Searchbarfinder.tsx`).
- `src/components/ui/pagination.tsx` — corregir `className="..."` literal: clases reales con cursor-pointer, hover y disabled.

**6. Productos — indicador de desplegable**
- `src/components/providers/products/views/ProductsPage.tsx:125-137` — envolver el `<select>` en `div.relative` y agregar `<ChevronDown>` absoluto a la derecha con `pointer-events-none` (patrón `color-dropdown.tsx`). Es un select nativo (sin estado open/close controlable): indicador estático.
- Consistencia (mismo defecto, mismo patrón): `src/components/categories/filters/CategoryFilter.tsx:35-43` y `src/components/movements/MovementModal.tsx:157-158`.

**7. Apariencia — guardado manual**
- `src/components/admin/diseno/apariencia/SeccionTipografia.tsx` — quitar `guardar(nuevas)` de `cambiarPrincipal`/`cambiarSecundaria`; agregar `isPending` (useTransition), snapshot `base`, `tieneCambios`, `<form onSubmit>` + botón "Guardar tipografía" (patrón `SeccionColores.tsx:136-145`); en submit: `updateBrandingConfig` + toast + `setBase` + `router.refresh()` + `aplicarTipografiaDocumento` (como hoy, línea 48). El preview local se mantiene.
- `src/components/admin/diseno/apariencia/SeccionEstilo.tsx` — quitar `guardar(nuevo)` de los 3 `alCambiar`; agregar `isPending`, dirty-check, `<form>` + botón "Guardar estilo" + `router.refresh()` (hoy no lo llama).
- Sin cambios en `updateBrandingConfig` ni en BD.

### Ejecución
- Subagentes en paralelo (archivos sin solapamiento): A (punto 1), B (punto 2), C (puntos 3-4: Header + schema/migración + cadena de flags + layout guard + admin), D (puntos 5-6: globals.css + feedback + chevron), E (punto 7). La migración de Prisma la ejecuta el orquestador al finalizar C.
- Agente verificador final (reglas AGENTS.md: una función exportada por archivo, ≤400 líneas, imports `@/`, español, sin `any`, boy scout).
- Comandos: `npx tsc --noEmit`, `npm run lint`.

### Verificación manual
1. Crear carrusel con slide sin link → editar carrusel → guarda sin error (mensaje claro si faltara imagen).
2. Ocultar carrusel / destacada / ubicación → aparecen en "Secciones ocultas" → "Mostrar" los recupera; la home pública no muestra ocultos; "Eliminar" sigue siendo el único borrado físico.
3. "Catálogo" visible en el navbar sin desplegar (desktop y mobile); "Plan Ahorro" sigue en el desplegable solo si está habilitado.
4. Plan de ahorro deshabilitado → 404 por URL directa y sin link en navbar; habilitarlo desde Configuración → Páginas del sitio lo restaura automáticamente.
5. Cursor pointer + hover/active en botones, acordeones y cards clickeables; select de Productos con chevron.
6. Tipografía y Estilo no persisten hasta "Guardar"; navegar sin guardar revierte a lo guardado en BD.
7. Revisar que ninguna corrección rompa home pública, carrito, búsqueda, admin ni el drag & drop de secciones.

---

## Refactor completo de Cloudinary: estructura escalable, categorías, productos, carruseles y eliminación segura

### Objetivo
Reemplazar las carpetas hardcodeadas (`gestion-stock/garments`, `gestion-stock/carousels/slides`, `gestion-stock/home-grids`, `page-config`) por una arquitectura organizada, centralizada en un servicio y preparada para multi-tenant:

```text
{RAIZ}/
├── garments/
│   └── {categoryId}/
│       └── {garmentId}/
│           ├── imagen-1.webp
│           └── ...
├── carousels/
│   └── {carouselId}/
│       ├── imagen-1.webp
│       └── ...
└── page-config/
    ├── home-grids/{homegridId}/
    └── identidad/          (logo, favicon)
```

Sin imágenes huérfanas en Cloudinary, con errores amigables para el usuario, logging técnico para desarrollo y sin romper el frontend.

### Estado actual (auditoría completa)

**Configuración del SDK — ROTA:**
- `src/lib/cloudinary.ts:4-8` lee `CLOUDINARY_CLOUD_NAME`, pero `.env` tiene `CLOUD_NAME` → `cloud_name: undefined` en todas las configuraciones. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` tampoco existe.
- Configuraciones duplicadas que pisan la instancia global: `src/actions/garments.ts:11-15` y `src/actions/upload-product-image.ts:32-36` (esta última usa `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).
- `CLOUDINARY_UPLOAD_PROJECT_NAME` **no existe** hoy en el código ni en `.env` (0 coincidencias). `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` existe en `.env` pero ningún código lo usa.

**Subidas y carpetas hardcodeadas:**
| Carpeta | Archivo | Operación |
|---|---|---|
| `gestion-stock/garments` | `src/actions/garments.ts:125` | upload de `data:image` en `updateGarment` |
| `gestion-stock/garments` | `src/actions/upload-product-image.ts:40` | upload base64 (vía real de subida de productos) |
| `gestion-stock/carousels/{hero,banner,cards,slides}` | `src/actions/carousel/helpers.ts:5-10` | solo `slides` se usa; HERO/BANNER/CARDS muertos |
| `gestion-stock/home-grids` | `src/actions/page-config/home.actions.ts:63` | upload de grids |
| `page-config` | `src/app/api/upload-image/route.ts:25` | `upload_stream`, **sin auth**, con `any` |

**Flujo de productos (frontend):**
- `useProductForm.ts:212-217` convierte File → base64 y llama `uploadProductImage` ANTES de `createGarment`/`updateGarment`; las actions reciben `images: string[]` de URLs ya subidas.
- `createGarment` (`garments.ts:17-52`) solo persiste URLs (si le llegara `data:image` lo guardaría crudo en BD).
- `updateGarment` (`garments.ts:107-162`) SÍ soporta `data:image` (sube a carpeta fija) y destruye removidas con `extractPublicId` ANTES de actualizar BD (orden destructivo: si Prisma falla después, quedan filas apuntando a archivos borrados).
- `deleteGarment` (`garments.ts:164-178`): **no destruye imágenes de Cloudinary** y **no chequea auth** (inconsistente con create/update que sí lanzan `No autorizado`).

**Carruseles:**
- `createCarousel`/`updateCarousel`/`addCarouselSlide`/`updateCarouselSlide` suben `data:image` vía `uploadCarouselImage` (carpeta `slides` fija).
- `updateCarousel` (`carousel-service.ts:103-139`) borra TODOS los slides y los recrea: **las imágenes reemplazadas/eliminadas quedan huérfanas** (igual que `updateCarouselSlide`, que sube la nueva sin destruir la vieja).
- `deleteCarousel` y `deleteCarouselSlide` SÍ destruyen (via `extractPublicId`), pero fallan en cascada si una imagen falla y destruyen ANTES de BD.
- `duplicateCarousel` (`carousel.actions.ts:344-386`) reutiliza las mismas URLs: borrar la copia destruiría imágenes del original.
- `addCarouselSlide`, `updateCarouselSlide`, `deleteCarouselSlide`, `reorderCarousels`: sin consumidores en la UI actual (todo pasa por el wizard con create/updateCarousel), pero deben quedar correctas.

**Otros huérfanos y defectos:**
- `updateHomeGrids` (`home.actions.ts:53-127`): sube grids nuevos pero **nunca destruye** los reemplazados ni los eliminados (borra filas con `deleteMany`).
- Branding (`branding.actions.ts`): reemplazar logo/favicon no destruye el anterior; solo `clearPageConfig` limpia.
- `maintenance.actions.ts:26` referencia `existing.banner`, campo que **no existe** en `PageConfig` (solo existe `banners Banner[]`).
- Código muerto: `src/lib/upload-image.ts`, `src/actions/page-config/shared/upload-page-image.ts`, tipos `FOLDERS.HERO/BANNER/CARDS` de carousel.
- `extractPublicId` (`utils.ts:28-41`) es frágil: falla con URLs sin segmento de versión, firmadas (`s--...--`), con transformaciones, con puntos en el public_id o delivery types no-`upload`. Call sites: `garments.ts:137`, `carousel.actions.ts:157,301`, `maintenance.actions.ts:34`, `upload-page-image.ts:19` (muerto).
- Errores técnicos expuestos al usuario: `garments.ts:72` (`error.message`), `branding.actions.ts:84,130`, `movements.ts:54`, `auth-actions.ts:96`.

**Prisma (relevante):**
- `GarmentImage`: `id, srcImage @db.Text, alt?, order, garmentId` — **sin `publicId`**. Cascade `GarmentImage→Garment` OK.
- `CarouselSlide`: `image String? @db.Text` — **sin `publicId`**. Cascade `CarouselSlide→Carousel` OK.
- `Category`: solo `id` (cuid) + `name @unique`. **Sin slug**. `Garment.categoryId` es obligatoria. No hay constraint que garantice que `subCategoryId` pertenezca a la misma categoría.
- Sin modelo Tenant: single-tenant (`PageConfig` singleton id=1). `relationMode = "prisma"` (cascades emuladas desde Prisma Client).
- Build usa `prisma db push --accept-data-loss` (no migraciones manuales): agregar columna nullable es no destructivo.

**Caché/revalidación actual (a conservar):** `revalidateTag("products")` + `product-${id}` (garments), `revalidateTag("carousels")` + `"page-config"` + `revalidatePath("/")` (carruseles), `revalidatePath("/", "layout")` (home), `"branding-config"` (branding/maintenance).

### Decisiones tomadas (confirmadas con el usuario)
1. **Raíz multi-tenant:** `obtenerRaizCloudinary()` lee `CLOUDINARY_UPLOAD_PROJECT_NAME` (futuro: `tenantId`). Único punto de cambio.
2. **Segmento de categoría = `categoryId` estable** (cuid). No slug ni nombre: renombrar una categoría no rompe referencias ni exige mover imágenes. La subcategoría sigue siendo responsabilidad de la BD (sin profundidad extra).
3. **Prisma:** agregar `publicId String? @db.Text` a `GarmentImage` y `CarouselSlide`. Fallback lazy: si `publicId` es null se deriva de la URL con el nuevo `obtenerPublicIdDesdeUrl` (soporta filas viejas sin backfill). Habilita cleanup global de huérfanos en el futuro (comparar `publicId` de Cloudinary vs BD).
4. **Contrato de garments:** `createGarment`/`updateGarment` reciben base64 (imágenes nuevas) y URLs (existentes). La subida ocurre en la server action DESPUÉS de crear el producto (necesita `garmentId`). Se elimina `uploadProductImage` (único consumidor: `useProductForm.ts`). El wizard de carruseles ya envía base64|URL: sin cambios de frontend.
5. **Estrategias de sincronización BD ↔ Cloudinary (Cloudinary NO es transaccional con Prisma):**
   - **Create:** crear registro (sin imágenes) → subir a carpeta correcta → guardar `{srcImage, publicId, order}`. Fallo de subida → compensación: destruir subidas parciales + borrar el registro → error amigable.
   - **Update:** subir nuevas a la carpeta de la NUEVA categoría → si cambió categoría, mover con `rename` las conservadas (trackeando pares old→new para rename inverso) → actualizar BD (URLs+publicIds) → **después del éxito** destruir las removidas (tolerante). Fallo de BD → compensar (rename inverso + destruir nuevas).
   - **Delete:** BD primero (si falla por P2003/FK, las imágenes quedan intactas y se informa el error) → cleanup tolerante después (faltante = éxito; error = log + aviso). Nunca destruir imágenes todavía usadas.
   - **Replace slide/imagen:** subir nueva → guardar → destruir vieja post-BD.
   - **Cambios de texto/orden/link:** no tocar la imagen.
   - **Duplicate carousel:** re-subir cada imagen a la carpeta de la copia (no compartir URLs; hoy borrar la copia rompería el original).
6. **Errores:** usuario recibe mensajes accionables y ubicativos (p. ej. "El SKU ingresado ya pertenece a otra variante.", "No se pudieron cargar las imágenes del producto. Intentá nuevamente.", "La información se actualizó, pero una imagen no pudo eliminarse correctamente."). Técnicos: `console.error("[CLOUDINARY][ETIQUETA]", error)`.
7. **Auth:** se conservan todos los chequeos existentes; se AGREGA el faltante en `deleteGarment` y en `/api/upload-image`.
8. **Alcance total:** productos, carruseles, home-grids, branding (logo/favicon), api route, maintenance y limpieza de código muerto.

### Estructura del servicio central
**Nuevo `src/lib/services/cloudinary-service.ts`** (patrón de los services existentes, varias funciones del mismo dominio; ~200 líneas):
- `obtenerRaizCloudinary(): string` — `process.env.CLOUDINARY_UPLOAD_PROJECT_NAME` (único punto de cambio a tenantId).
- `obtenerCarpetaPrenda(categoryId, garmentId)`, `obtenerCarpetaCarrusel(carouselId)`, `obtenerCarpetaGrids(homegridId)`, `obtenerCarpetaIdentidad()` — generan `{raiz}/...` sin hardcodeo.
- `subirImagen(base64, carpeta, prefijoNombre?)` y `subirImagenes(...)` — upload con `format: "webp"` + `transformation: [{ fetch_format: "auto", quality: "auto" }]`, devuelven `{ url, publicId }`.
- `eliminarImagen(publicId)` / `eliminarImagenes(publicIds)` — tolerantes: recurso inexistente = éxito; cada falla se loguea y no corta a las demás.
- `moverImagen(publicIdViejo, publicIdNuevo)` — `cloudinary.uploader.rename`, devuelve la nueva URL.
- `obtenerPublicIdDesdeUrl(url)` — `extractPublicId` robusto: valida host `*.cloudinary.com`, salta segmento de versión opcional (`v\d+`), conserva carpetas, quita extensión solo si es conocida, devuelve `null` para URLs externas.
- Logging centralizado: `[CLOUDINARY][PRENDA_SUBIDA]`, `[CLOUDINARY][PRENDA_ELIMINACION]`, `[CLOUDINARY][CARRUSEL_SUBIDA]`, `[CLOUDINARY][CARRUSEL_ELIMINACION]`, `[CLOUDINARY][MOVIMIENTO]`, `[CLOUDINARY][GRIDS_SUBIDA]`, `[CLOUDINARY][IDENTIDAD_SUBIDA]`, etc.

### Plan de solución

**Paso 0 — Infraestructura (secuencial, dependencia del resto):**
1. `.env` — renombrar `CLOUD_NAME` → `CLOUDINARY_CLOUD_NAME`; agregar `CLOUDINARY_UPLOAD_PROJECT_NAME=gestion-stock`.
2. `prisma/schema.prisma` — agregar `publicId String? @db.Text` a `GarmentImage` (luego de `srcImage`) y a `CarouselSlide` (luego de `image`). Aplicar con `npx prisma db push` (requiere BD alcanzable; el build ya lo hace).
3. `src/lib/cloudinary.ts` — dejar SOLO la config (`CLOUDINARY_CLOUD_NAME`). Eliminar las re-configuraciones de `src/actions/garments.ts:11-15` y `src/actions/upload-product-image.ts:32-36`.
4. Crear `src/lib/services/cloudinary-service.ts` (API de arriba).
5. Migrar `obtenerPublicIdDesdeUrl` y eliminar `extractPublicId` de `src/lib/utils.ts` tras migrar todos sus call sites (queda solo `fileToBase64`, `cn`, `serializeData`, `getContrastColor`).
6. Eliminar código muerto: `src/lib/upload-image.ts`, `src/actions/page-config/shared/upload-page-image.ts`, `src/actions/carousel/helpers.ts`, `src/actions/upload-product-image.ts`.

**Paso 1 — Productos:**
- `src/lib/services/garment-service.ts` — cambiar firma de imágenes a `{ url, publicId, order }[]` en `createGarment` y `updateGarmentWithDetails`; persistir `publicId` (el `deleteMany`+`createMany` de imágenes sigue igual, con `publicId` incluido).
- `src/actions/garments.ts` (~300 líneas, vigilar límite 400):
  - `createGarment`: validar con `garmentSchema` (base64|URL permitidos) → `garmentService.createGarment` sin imágenes → subir cada base64 a `obtenerCarpetaPrenda(categoryId, garmentId)` → `garmentImage.createMany` con url+publicId+order → `revalidateTag("products")`. Fallo: destruir subidas parciales + borrar producto → `{ error: "No se pudieron cargar las imágenes del producto. Intentá nuevamente." }`.
  - `updateGarment`: leer prenda actual (categoryId) + imágenes existentes → subir nuevas a la carpeta de la NUEVA categoría → si cambió la categoría, `moverImagen` por cada conservada (track pares para rename inverso) → `updateGarmentWithDetails` con lista final → post-éxito destruir removidas (tolerante; si alguna falla devolver `success: true` + aviso "La información se actualizó, pero una imagen no pudo eliminarse correctamente.") → fallo de BD: rename inverso + destruir nuevas + error amigable → `revalidateTag("products")` + `product-${id}`.
  - `deleteGarment`: AGREGAR auth ADMIN → leer imágenes → `garmentService.deleteGarment` (BD primero; P2003 → "No se puede eliminar: existen registros vinculados.") → destruir imágenes tolerante → revalidaciones existentes.
  - `getGarments`/`getGarmentById`/`getGarmentsByNames`: quitar `error.message` del usuario.
- `src/hooks/useProductForm.ts` — `handleSubmit`: para `img.file` → `fileToBase64` y push del base64 directo en `images` (sin `uploadProductImage`); para `img.url` → push URL. Mantener `PendingImage` y toasts existentes.
- `src/lib/zod.ts` — `garmentSchema.images`: `z.array(z.string().refine(v => v.startsWith("data:image") || v.startsWith("http"), ...))` (opcional, validación temprana).

**Paso 2 — Carruseles:**
- Dividir `src/actions/carousel/carousel.actions.ts` (387 líneas; con la lógica nueva excedería 400 — regla boy scout):
  - `carousel.actions.ts`: `createCarousel`, `updateCarousel`, `deleteCarousel`, `reorderCarousels`, `getCarousels`, `getAllCarousels`, `updateCarouselActive`, `duplicateCarousel` + `requireAdmin` local.
  - Nuevo `carousel-slide.actions.ts`: `addCarouselSlide`, `updateCarouselSlide`, `deleteCarouselSlide`.
- `createCarousel`: crear carrusel sin slides → subir cada base64 a `obtenerCarpetaCarrusel(carouselId)` → `createMany` slides con url+publicId → compensación (destruir subidas + borrar carrusel) si falla → `revalidateTag("carousels")`.
- `updateCarousel`: diff por slide contra DB: (a) slide existente con imagen URL sin cambios → conservar (textos/orden se actualizan en BD); (b) imagen base64 (nueva o reemplazo) → subir a `obtenerCarpetaCarrusel(id)`; (c) slides removidos → destruir post-BD. Después de `carouselService.updateCarousel` exitoso: destruir viejas de reemplazos y removidas (tolerante). Fallo de BD → destruir las recién subidas.
- `updateCarouselSlide`: obtener slide + carouselId → si imagen es base64: subir, actualizar slide, destruir vieja post-éxito; si es URL sin cambios: solo `updateSlide`.
- `deleteCarouselSlide`: BD primero (delete + reorden) → destruir imagen post-éxito (tolerante).
- `deleteCarousel`: BD primero (cascade) → destruir todas las imágenes post-éxito (tolerante, `Promise.all` con captura por slide) → cleanup `sectionOrder` existente → revalidaciones existentes.
- `duplicateCarousel`: crear copia → por cada slide con URL Cloudinary, subir desde la URL a `obtenerCarpetaCarrusel(nuevoId)` y actualizar slides con nuevas url+publicId → fallo: borrar copia + destruir subidas. (Las imágenes dejan de compartirse con el original.)
- Conservar límites, `migrateSettings`, `resolverEnlaceGuardado`, P2002 → "Ya existe un carrusel con ese orden" y `revalidateTag("page-config")` + `revalidatePath("/")` donde ya estaban.

**Paso 3 — Page-config:**
- `src/actions/page-config/home.actions.ts` — `updateHomeGrids`: crear/obtener `homegridId` ANTES de subir → subir nuevos a `obtenerCarpetaGrids(homegridId)` → leer grids existentes → transacción actual (deleteMany+createMany) → post-éxito destruir imágenes de grids removidos (tolerante). Conservar `revalidatePath("/", "layout")`.
- `src/actions/page-config/branding.actions.ts` — `updateBrandingConfig`: si `logo`/`favicon` cambian y el valor anterior es una URL Cloudinary del tenant, destruirlo post-éxito (tolerante). Reemplazar `error instanceof Error ? error.message` por mensajes fijos.
- `src/actions/page-config/maintenance.actions.ts` — `clearPageConfig`: usar servicio (destruir `logo`, `favicon` y las imágenes de `existing.banners` — corregir el campo `banner` inexistente), tolerante; revalidaciones existentes.
- `src/app/api/upload-image/route.ts` — agregar `auth()` + chequeo ADMIN; subir vía `subirImagen` a `obtenerCarpetaIdentidad()`; devolver `{ url, publicId }`; eliminar `any`; errores genéricos al cliente.

**Paso 4 — Verificación:**
- Grep global: `cloudinary.uploader.upload|destroy|rename` fuera del servicio, `"gestion-stock` hardcodeado, `extractPublicId` huérfano, `CLOUDINARY_UPLOAD_PROJECT_NAME` leído directamente en actions (solo en el servicio).
- `npx tsc --noEmit`, `npm run lint`, `npm run build` (con BD alcanzable para aplicar `db push` de `publicId`).
- Agente verificador final (AGENTS.md §Uso de subagentes): revisar reglas — español, una función exportada por archivo, ≤400 líneas (boy scout en `carousel.actions.ts` y `garments.ts`), imports `@/`, sin `any` nuevo, auth intacta, revalidaciones conservadas, mensajes amigables — y reparar.

### Fuera de alcance (por ahora)
- Migración masiva de las imágenes YA subidas con carpetas viejas: siguen eliminándose/moviéndose vía `publicId` guardado o fallback de URL; las nuevas van a la estructura nueva. Un futuro script puede renombrarlas (la info necesaria ya queda en BD: `publicId` + `categoryId` + `garmentId`).
- Sistema automático de limpieza global de huérfanos: la arquitectura lo habilita (comparar publicIds de Cloudinary contra BD), pero no se implementa ahora.
- El modelo `Banner` (solo se lee hoy, sin actions de create/update/delete): solo se limpian sus imágenes en `clearPageConfig`.
- Los campos `svgPath` de `BoardTypeOption`/`BoardTailOption` (strings SVG, no son recursos de Cloudinary).

### Riesgos conocidos
- `duplicateCarousel` pasa de instantáneo a requerir N subidas (máx. 10 slides por tipo): aceptable.
- Límite de body de Server Actions (~1 MB): las imágenes ya se comprimen en el frontend (`compressImage` 1200x1200 0.8), por lo que el base64 queda muy por debajo; `uploadProductImage` ya operaba igual.
- Si la BD no está alcanzable al ejecutar `db push`, el build fallará en Prisma generate/db push: ejecutar con BD online.

### Ejecución
- **Paso 0** (infraestructura) lo hace el orquestador en secuencia (define contratos del servicio: nombres de funciones, carpetas, logging).
- Subagentes en paralelo con interfaces predefinidas: A (Paso 1 — productos: garment-service, garments.ts, useProductForm, zod), B (Paso 2 — carruseles: split de actions + carousel-slide.actions), C (Paso 3 — page-config: home/branding/maintenance/api route). Sin solapamiento de archivos.
- Agente verificador final (reglas AGENTS.md) + comandos de verificación del Paso 4.
- Los archivos `PENDIENTES.md` y `CLAUDE.md` no se tocan (CLAUDE.md describe una arquitectura vieja de upload preset; se actualizará aparte si hace falta).

### Verificación manual
1. Crear producto con 2-3 imágenes → revisar en Cloudinary `{raiz}/garments/{categoryId}/{garmentId}/` con las imágenes; editar agregando/reemplazando/quitando imágenes → las quitadas desaparecen de Cloudinary y las existentes no se re-suben.
2. Cambiar la categoría del producto → las imágenes aparecen bajo la NUEVA categoría (rename), sin duplicados en la vieja.
3. Eliminar producto → sus imágenes desaparecen de Cloudinary.
4. Crear/editar carrusel con reemplazo y eliminación de slides → las imágenes viejas se destruyen; editar solo textos no re-sube ni borra imágenes.
5. Duplicar carrusel → la copia tiene imágenes propias; borrar la copia NO afecta al original.
6. Editar home grids (reemplazar/quitar) → imágenes viejas destruidas. Cambiar logo/favicon → el anterior se destruye.
7. Errores: sin mensajes técnicos en toasts (probar SKU duplicado, producto inexistente, corte de red en subida).

---

## Destacada (home), modal de imágenes reutilizable con crop, scroll-lock del carrito y footer configurable

### Alcance (5 bloques)
1. **Sección Destacada**: corregir renderizado roto en desktop/tablet sin romper mobile.
2. **Modal de Destacada**: refactor completo tomando como referencia el flujo de imágenes de Carruseles; eliminar el buscador de productos; cerrar todo el flujo (modal + drawer) tras subir con éxito.
3. **Previsualización + crop de imágenes en TODOS los modales que manejan imágenes**, mediante UN único componente reutilizable.
4. **Scroll-lock**: bloquear el scroll del body cuando el carrito/modal está abierto (solución general reutilizable, no un hack del carrito).
5. **Footer configurable** desde el panel de administración + crédito "Creado por LOGABYTE".

### Estado actual (relevado)

**1. Destacada — render público:**
- Flujo: `HomeClient.tsx` (caso `"featured"`, líneas 170-175 y 224-226) → `ProductLayout.jsx` → `FeaturedSection.jsx` → `LayoutGrid`/`LayoutCollage`/`LayoutMinimal` → `CategoryCard`.
- `CategoryCard.tsx:34-38`: alturas fijas descomunales en grid — `h-[60vh] md:h-[80vh] min-h-[400px]` (tarjetas al 80% del viewport en desktop).
- `LayoutCollage.tsx:25`: `grid-cols-1 md:grid-cols-4 auto-rows-[250px] grid-flow-dense` — filas fijas que recortan mal las imágenes (`bg-cover` absoluto) y reordenan visualmente.
- `ProductLayout.jsx:57`: wrapper `min-h-screen` que infla la sección; `:66` renderiza un `<main>` anidado (HTML inválido: `HomeClient.tsx:172` ya envuelve en `<main>`); `:69-74` pasa props muertos a `FeaturedSection` (no los declara); `:78-80` footer vacío; `:8-54` estado local de carrito (`tech_cart`) e instancia duplicada de `CartSidebar` en paralelo al `CartContext` global.
- `FeaturedSection.jsx:32`: sección `py-16` sin `overflow-hidden`; solo `w-full` (desbordes caen sobre el `overflow-x-hidden` del body).
- `LayoutGrid.tsx:6`: `gap-0`; tarjetas pegadas.

**2. Destacada — modal de administración:**
- Flujo: `/admin/design/contenido` → `GestorContenido.tsx` → `setDrawerDestacada(true)` → `DrawerSeccionDestacada.tsx` (Sheet) → `HomeSectionsDesign.tsx` → `GridModal.tsx` (modal por tarjeta).
- `GridModal.tsx` (324 líneas): sin validaciones (ni imagen, ni título, ni URL), sube la imagen como `dataURL` crudo sin comprimir (`FileReader.readAsDataURL`, líneas 81-90), preview fijo de 64px, sin estados de carga propios, colores pintados con `secondaryColor` + `getContrastColor` local duplicada (líneas 19-27).
- Desplegable ilegible: `destination-picker/DestinationType.tsx:44-48` — `<select>` con `bg-white border-neutral-300` que ignora el tema oscuro del modal.
- Buscador de productos que sobra: `destination-picker/SearchableSelect.tsx` (98 líneas), usado por `DestinationValue.tsx` para tipo producto; carga TODOS los `garment` (`getProductsPicker`, sin filtrar activos) al abrir el drawer. Colores neutros sin tema (`text-neutral-400/500`, `hover:bg-neutral-100`).
- `destination-picker/` (6 archivos) solo lo consume `GridModal.tsx:256`.
- Guardado por lote: `HomeSectionsDesign.tsx:153-192` — "Guardar Todo" → `updateSectionVisibility` + `updateHomeGrids` (borra y recrea todas las grids, sube `data:image` a `page-config/home-grids/{id}`). Tras éxito: toast + `router.refresh()` pero **el drawer NO se cierra**. Uso masivo de `any` (viola `no-explicit-any`).
- Server: `src/actions/page-config/home.actions.ts` (139 líneas) con `updateSectionVisibility` y `updateHomeGrids` (rollback de subidas ya implementado).

**3. Imágenes — puntos de subida existentes (4 activos):**
| Flujo | Archivo | Comportamiento |
|---|---|---|
| Carrusel | `admin/carousel/SlideEditor.tsx` (391) + `admin/carousel/ImageUploader.tsx` (124) | Compresión 1200×1200 q0.8, límite 5MB, preview 64px, subida diferida al guardar el wizard. **Referencia del refactor.** |
| Destacada | `admin/design/GridModal.tsx` (324) | dataURL crudo, sin compresión, sin validación. |
| Productos | `providers/products/forms/ImageUploader.tsx` (216) | Multi (máx 4), comprime, previews, drag&drop. Sin límite de tamaño. |
| Branding | `admin/page-config/shared/ImageUploader.tsx` (131) | Sube al instante vía `POST /api/upload-image` (carpeta `page-config/identidad`). Sin validación. |

- **No existe crop, ni zoom, ni lightbox en ningún lado.** No hay librerías instaladas (`react-easy-crop`, `cropperjs`, etc.).
- Cloudinary: subidas firmadas server-side vía `cloudinary-service.ts` (`subirImagen` con `format: "webp"` + `fetch_format: auto/quality: auto`), carpetas por dominio (`garments/{catId}/{id}`, `carousels/{id}`, `page-config/home-grids/{id}`, `page-config/identidad`). El base64 viaja dentro de las server actions y se sube al guardar (excepto branding).
- `compressImage` (`src/lib/image-utils.ts:54`) convierte SIEMPRE a JPEG → pierde transparencia (problemático para el logo).
- Páginas personalizadas: campo `image` existe en BD pero sin UI (fuera de alcance).

**4. Scroll-lock:**
- Solo 2 implementaciones: `ui/sheet.tsx:40-48` (guarda/restaura `overflow`, correcto) y `LoginModal.tsx` (`hidden`/`unset`, sin restaurar previo).
- **`CartSidebar.tsx` NO bloquea el scroll del body** ni cierra con Escape. `WhatsAppOrderForm` (apilado sobre el carrito), `confirm-dialog`, modales legales (`CookieModal`/`PrivacyModal`/`TermsModal`), `SidebarMovil`, `MovementModal`: sin lock.
- No existe hook compartido. `radix-ui` instalado pero solo se usa `@radix-ui/react-slot` (sin Dialog/Sheet de Radix en uso).

**5. Footer:**
- No existe componente Footer: el footer real está hardcodeado en `AppGate.tsx:54-76` (2 links legales + copyright). `<footer>` vacíos en `LayoutComponent.tsx:59-63` y `ProductLayout.jsx:78-80`. `EscuelaFooter.tsx` aparte (dominio escuela, se conserva).
- Los modales legales (`PrivacyModal`, `TermsModal`) son hardcodeados: NO leen `pageConfig.termsAndConditions`/`privacyPolicy` (los textos editados en admin nunca llegan al front).
- Datos YA existentes en `PageConfig` (schema.prisma:196-249): `storeName`, `description`, `slogan`, `logo`, `favicon`, colores, `phone`, `whatsapp`, `email`, `address`/`city`/`province`/`country`/`postalCode`/`mapsUrl`/`locationEnabled`, 6 redes (`instagram`…`linkedin`), `termsAndConditions`, `privacyPolicy`, `sectionOrder`. Disponibles en cliente vía `usePageConfig()`.
- NO existen: textos propios del footer, copyright configurable, toggles de visibilidad de columnas, modelo `Footer`. No hay sección "Footer" en `/admin/pageConfig` (`PanelConfiguracion.tsx` + `DrawersConfiguracion.tsx`).

### Decisiones tomadas (confirmadas con el usuario)
1. **Destacada persiste por lote** (espejo del wizard de carruseles): el nuevo modal de tarjeta guarda en estado local del drawer y cierra; "Guardar Todo" sube imágenes y persiste todo; **al finalizar con éxito: toast + cerrar drawer + `router.refresh()`**. Si falla, el drawer queda abierto con el error visible.
2. **Crop: instalar `react-easy-crop`** (zoom, arrastre y aspect listos; se integra con canvas para generar la imagen recortada antes de subir).
3. **Footer: secciones estándar + toggles** (sin editor de links arbitrarios). Columnas: Sobre la tienda, Navegación (auto), Contacto, Ubicación, Redes, Legales.
4. **Almacenamiento sin cambios de infraestructura**: el recorte ocurre en el cliente ANTES de subir; el dataURL resultante viaja por el flujo existente (server action → `subirImagen` a la carpeta Cloudinary del dominio). Sin imágenes duplicadas, sin tocar carpetas ni transformaciones.
5. **El buscador de productos se elimina del flujo de Destacada**; como `destination-picker/` queda sin consumidores, se borran sus 6 archivos.
6. **ProductLayout.jsx**: se elimina el estado local de carrito y la instancia duplicada de `CartSidebar` (existe el global montado en `LayoutComponent`).
7. **`destination-picker` y los selectores**: el nuevo selector de destino de Destacada usa `<select>` nativo estilizado con el tema (fondo heredado del panel, opciones legibles), sin buscador.

### Plan de solución

**Fase 1 — Fundaciones compartidas**
1. Instalar `react-easy-crop` (`npm i react-easy-crop`).
2. Nuevo hook `src/hooks/use-bloqueo-scroll.ts` — una función exportada `useBloqueoScroll(activo: boolean)`:
   - Conteo de referencias global (modales apilados: `WhatsAppOrderForm` sobre el carrito no desbloquea al cerrar uno solo).
   - Guarda el `overflow` previo de `document.body`; aplica `hidden` al abrir y restaura al cerrar el último.
   - Compensa el ancho del scrollbar (medir `window.innerWidth - documentElement.clientWidth`) aplicando `padding-right` al body para evitar saltos de posición; iOS/mobile contemplado (no hay scrollbar visible → no compensa).
   - Refactorizar `src/components/ui/sheet.tsx:40-48` y `src/components/auth/LoginModal.tsx` para consumir el hook (regla boy scout: una sola lógica de lock).
3. Nuevo dominio `src/components/imagen/` (español, una función exportada por archivo, ≤400 líneas, imports `@/`):
   - `SubidaImagen.tsx` — componente reutilizable: seleccionar archivo → validar (PNG/JPG/JPEG/WebP, tamaño máx configurable, error visible inline) → comprimir (`compressImage`) → abrir `EditorRecorte` → devolver dataURL + preview con botones "Editar recorte" y "Quitar". Props: `valor`, `alCambiar`, `relacionAspecto` (default 16/9), `formaRecorte` (`"rectangular"` | `"redondeada"`), `tamanoMaximoMb` (default 5), `obligatoria`, `etiqueta`, `textoAyuda`, `anchoMaximoCompresion` (default 1200), `errorExterno`.
   - `EditorRecorte.tsx` — modal interno (portal, colores de tema vía `usePageConfig` + `getContrastColor` de `@/lib/utils`): react-easy-crop con zoom (slider + wheel), arrastre, aspect configurable, Confirmar / Cancelar, soporte táctil; botón "Volver a editar" desde el preview.
   - `utilidades-recorte.ts` — `generarImagenRecortada(imagen, areaPixeles)`: canvas → dataURL; **preserva PNG cuando la imagen original tiene transparencia** (importante para el logo); JPEG con calidad 0.9 en el resto.
   - `tipos.ts` — tipos del dominio.
   - El componente NO sube a Cloudinary: entrega base64, compatible con el contrato actual de todas las server actions.

**Fase 2 — Migrar los 4 flujos de imagen al componente común**
1. **Carruseles**: `SlideEditor.tsx` + `admin/carousel/ImageUploader.tsx` pasan a usar `SubidaImagen` (mantener límite 5MB, textos y patrón). `SlideEditor` (391 líneas) debe quedar ≤400 tras el cambio (boy scout si excede).
2. **Productos**: `providers/products/forms/ImageUploader.tsx` — cada imagen nueva pasa por selección + crop; cada preview conserva botón "Editar recorte" y "Quitar"; mantener multi (máx 4), compresión y drag&drop.
3. **Branding**: `admin/page-config/shared/ImageUploader.tsx` — preview + crop antes de enviar el blob recortado al `/api/upload-image` existente (contrato del FormData no cambia). Favicon `relacionAspecto={1}`, logo con forma libre/1:1 según sección (`SeccionIdentidad.tsx`). Tras migrar, eliminar el uploader viejo si queda sin uso.
4. **Destacada**: dentro del refactor de la Fase 3.
5. Al tocar estos archivos: eliminar `any`, respetar límites de líneas y reglas AGENTS.md.

**Fase 3 — Sección Destacada**

*3.1 Render público (desktop/tablet/mobile):*
- `CategoryCard.tsx:34-38` — reemplazar alturas fijas por proporciones con máximo: p. ej. grid `aspect-[3/4] md:aspect-[16/10] max-h-[520px] w-full`, minimal `aspect-[4/3] max-h-[380px]`, collage `h-full min-h-[200px]`. Mobile queda visualmente equivalente al actual.
- `LayoutCollage.tsx:25` — `auto-rows-[250px]` → alturas responsive (`auto-rows-[200px] md:auto-rows-[240px]`) y revisar `grid-flow-dense` para evitar reordenamientos extraños; asegurar `overflow-hidden` en las celdas.
- `ProductLayout.jsx` — quitar `min-h-screen` (57), el `<main>` anidado (66), el footer vacío (78-80), los props muertos a `FeaturedSection` (69-74) y el carrito local duplicado + su `CartSidebar` (8-64); queda como contenedor simple de `FeaturedSection`.
- `HomeClient.tsx:172` — cambiar `<main key="featured">` por `<section key="featured">` (evitar `<main>` anidado); `:225` igual.
- `FeaturedSection.jsx:32` — agregar `overflow-hidden` y verificar paddings; `LayoutGrid.tsx:6` — gap consistente.
- Verificar overflow horizontal en desktop/tablet.

*3.2 Modal de Destacada (espejo de Carruseles):*
- **Reescribir `GridModal.tsx`** con el patrón de `SlideEditor`: portal + overlay (`bg-black/80 backdrop-blur`) y panel con colores de tema (variables de `usePageConfig`, sin copias locales de `getContrastColor`), bottom-sheet en mobile, header/footer sticky, estados `isSubmitting` + `error` visible, formulario real.
  - Imagen: `SubidaImagen` con crop (`relacionAspecto` según layout elegido en el drawer, default 16/10).
  - **Nuevo selector de destino** (dentro de `GridModal` o componente del dominio destacada): "Sin destino / Categoría / Página / URL externa" con `<select>` nativo estilizado con el tema (fondo heredado, `option` con color de fondo del panel) — corrige el desplegable ilegible. Sin buscador de productos.
  - Validaciones: imagen obligatoria, URL externa empieza con `http`, límites de caracteres; errores visibles; sin cierre ante fallo; cancelación limpia.
  - Links: resolver igual que hoy (`linkType`/`linkValue` → `mapGridToCard` en render; `updateHomeGrids` ya mapea al guardar).
- Eliminar `src/components/admin/destination-picker/` (6 archivos, sin consumidores tras el refactor).
- `HomeSectionsDesign.tsx` — tipar (eliminar `any`); mantener dnd-kit, título y selector de layout; en `handleSave` tras éxito de `Promise.all`: `toast.success` + **cerrar drawer** (`setDrawerDestacada(false)` en `GestorContenido` o vía prop `alGuardar` del drawer) + `router.refresh()`. En error: el drawer queda abierto y el error se muestra (toast de error, sin datos inconsistentes). Re-sincronizar `grids` local tras guardar (los ids temporales se reemplazan).
- Server actions (`home.actions.ts`) sin cambios de fondo (ya tienen rollback de subidas); verificar que `updateHomeGrids` devuelva errores accionables al drawer.

**Fase 4 — Scroll-lock general**
- `CartSidebar.tsx` — aplicar `useBloqueoScroll(isOpen)`; agregar cierre con Escape; el scroll interno del carrito ya existe (línea 72). Mantener animaciones framer-motion.
- `WhatsAppOrderForm` (`providers/products/forms/WhatsAppOrder.tsx`) — `useBloqueoScroll` con conteo apilado sobre el carrito.
- `ui/confirm-dialog.tsx`, `legal/CookieModal.tsx`, `legal/PrivacyModal.tsx`, `legal/TermsModal.tsx`, `layout/SidebarMovil.tsx` — aplicar el hook (solución general, sin hacks por modal).
- `ui/sheet.tsx` y `LoginModal.tsx` — migrar al hook (Fase 1).

**Fase 5 — Footer configurable**
1. **Prisma** (`schema.prisma`, modelo `PageConfig`): agregar
   - `footerAboutText String?` (texto "Sobre la tienda"; fallback `description`)
   - `footerCopyrightText String?` (fallback `© {año} {storeName}`)
   - `footerShowSobre Boolean @default(true)`, `footerShowNavegacion Boolean @default(true)`, `footerShowContacto Boolean @default(true)`, `footerShowUbicacion Boolean @default(true)`, `footerShowRedes Boolean @default(true)`, `footerShowLegales Boolean @default(true)`.
   - Aplicar con `npx prisma db push` (columnas nullable/default → no destructivo; el build ya lo ejecuta).
2. **Acciones/tipos/zod:**
   - `src/lib/zod.ts` — nuevo `footerSchema` (textos con máx. de caracteres, toggles booleanos).
   - Nuevo `src/actions/page-config/footer.actions.ts` — `updateFooterConfig` (valida con `footerSchema`, actualiza, `revalidatePath("/", "layout")` + `revalidateTag("page-config")`).
   - `src/actions/page-config/shared/types.ts` — agregar campos al `PageConfigInput`; `shared/defaults.ts` — defaults; `general.actions.ts` `getPageConfig` — incluir los campos nuevos en el `select`.
3. **Componente público** — nuevo dominio `src/components/footer/`:
   - `PiePagina.tsx` (default export; subcomponentes en archivos propios si supera 400 líneas): consume `usePageConfig()`.
     - Columnas según toggles: **Sobre la tienda** (logo + `storeName` + `footerAboutText`), **Navegación** (links generados de `sectionOrder`/secciones activas: Catálogo, Escuela, Arreglos, Plan de ahorro — respetando flags), **Contacto** (`phone`, `whatsapp`, `email` con links `tel:`/`wa.me`/`mailto:`), **Ubicación** (`address`, `city`, `mapsUrl` si `locationEnabled`), **Redes** (6 redes con íconos lucide: Instagram, Facebook, Youtube, Linkedin, X, Tiktok — usar `Music2` o ícono propio para Tiktok que no está en lucide), **Legales** (botones que abren `PrivacyModal`/`TermsModal`).
     - Línea inferior: copyright configurable + **"Creado por LOGABYTE"** centrado horizontalmente, integrado al diseño (separador sutil `border-t` + `opacity`), siempre visible.
     - Responsive: grid 2/3/4 columnas en desktop, apilado en mobile; colores con variables CSS del tema (`--color-fondo-sitio`, `--color-primario`, `--texto-sobre-fondo`).
   - `PrivacyModal.tsx`/`TermsModal.tsx` — pasar a leer `pageConfig.termsAndConditions`/`privacyPolicy` (con fallback a los textos actuales si están vacíos).
4. **Montaje único:** reemplazar el footer hardcodeado de `AppGate.tsx:54-76` por `<PiePagina />` (mantener los estados de los modales legales en AppGate y pasarlos por props); eliminar los `<footer>` vacíos de `LayoutComponent.tsx:59-63` y `ProductLayout.jsx:78-80`. `EscuelaFooter` se conserva.
5. **Admin:** nueva sección "Footer" en el panel de configuración:
   - `src/components/admin/configuracion/PanelConfiguracion.tsx` — nuevo ítem (grupo "General") con clave `footer`.
   - `src/components/admin/configuracion/DrawersConfiguracion.tsx` — mapear la clave al drawer con `FooterSection`.
   - Nuevo `src/components/admin/page-config/FooterSection.tsx` — texto "Sobre la tienda" (Textarea), copyright (Input) y 6 switches de visibilidad; guardado manual con `isPending` + toast + `router.refresh()` (patrón `SeccionColores`/`SeccionLegal`).
   - `tipos-configuracion.ts`/`tipos-panel.ts` — tipos del nuevo ítem.

**Fase 6 — Verificación**

### Ejecución
- **Fase 1** (dependencia `react-easy-crop` + hook + `src/components/imagen/`) la hace el orquestador primero: define los contratos exactos del componente (`SubidaImagen` props, `EditorRecorte` props, firma de `generarImagenRecortada`, `useBloqueoScroll(activo)`) para que el resto trabaje en paralelo.
- Subagentes en paralelo (archivos sin solapamiento):
  - A — Fase 2.1 y 2.2 (carruseles + productos).
  - B — Fase 2.3 y 2.4 (branding + migración/eliminación del uploader viejo).
  - C — Fase 3 (Destacada pública + modal + drawer + eliminación de destination-picker).
  - D — Fase 4 (scroll-lock en carrito, WhatsAppOrderForm, confirm-dialog, legales, SidebarMovil).
  - E — Fase 5 (prisma + actions + zod + PiePagina + AppGate/LayoutComponent + admin FooterSection). La migración `db push` la ejecuta el orquestador al recibir E.
- **Agente verificador global** al final (reglas AGENTS.md: español, una función exportada por archivo, ≤400 líneas con boy scout, imports `@/`, sin `any` nuevo, carpetas de dominio) + reparación.
- Comandos: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- No se tocan `CLAUDE.md` ni el resto de secciones de este archivo.

### Verificación manual
1. **Destacada**: desktop, tablet y mobile con layouts GRID/COLLAGE/MINIMAL — tarjetas proporcionadas, sin desbordes, sin `<main>` anidado (inspeccionar DOM), hover/zoom intacto, links funcionando.
2. **Modal Destacada**: agregar/editar tarjeta → seleccionar imagen → preview → crop (zoom/arrastre) → elegir destino (categoría/URL) → "Guardar Todo" → toast de éxito → drawer se cierra solo → home refleja los cambios. Fallo forzado (URL inválida sin imagen) → error visible y modal abierto.
3. **Carruseles**: wizard completo sin regresión; slide con crop y link; edición posterior sin errores.
4. **Productos**: subir hasta 4 imágenes con crop individual, reorden, reemplazo; validación de tamaño/formato visible.
5. **Branding**: logo/favicon con crop y transparencia PNG preservada; subida vía API existente sin cambios de carpeta.
6. **Carrito**: abrir → el body no scrollea; contenido largo scrollea dentro del carrito; abrir el form de specs (apilado) y cerrarlo → el scroll sigue bloqueado; cerrar carrito → scroll restaurado sin salto de posición; Escape cierra.
7. **Footer**: desktop y mobile con columnas/toggles; editar textos y toggles en `/admin/pageConfig` → Footer; links legales abren modales con los textos de BD; "Creado por LOGABYTE" centrado y siempre visible.
8. **Regresión general**: home pública, búsqueda, catálogo, admin de diseño y configuración sin cambios de comportamiento.

### Fuera de alcance (por ahora)
- UI de imagen en páginas personalizadas (campo `image` de `CustomSectionItem` sin UI — no es un modal existente).
- Horarios de atención y links arbitrarios de footer (los datos de horarios no existen en BD y el usuario eligió secciones estándar + toggles).
- `EscuelaFooter` (dominio escuela, se conserva).
- Multi-tenant / cambios de carpetas Cloudinary (ya cubiertos por el pendiente anterior).
- Lightbox/zoom de imágenes en el front público.

### Riesgos conocidos
- `compressImage` convierte a JPEG: la utilidad de recorte nueva debe preservar PNG con transparencia (logo); para el resto, JPEG es aceptable (comportamiento actual).
- `SlideEditor.tsx` (391 líneas) y `GridModal.tsx` (324, se reescribe) están al borde del límite de 400: verificar tras el refactor y dividir si hace falta.
- Límite de body de server actions (~1MB): el base64 comprimido ya opera dentro del margen actual.
- Eliminar el estado local de carrito de `ProductLayout.jsx` cambia la fuente de verdad a `CartContext` (ya montado globalmente en `LayoutComponent`): verificar persistencia `tech_cart` (la maneja `CartContext`, clave idéntica).
- El `<select>` nativo estilizado con tema: las `option` heredan el `background-color` del select en algunos navegadores; verificar en Chrome/Firefox/Safari.
- `db push` agrega columnas nullable/default: sin pérdida de datos; ejecutar con la BD alcanzable.

---

## Modales anidados: jerarquía de capas (z-index) reutilizable — modal de edición de Sección Destacada invisible

### Síntoma
En `/admin/design/contenido`, al editar la Sección Destacada:
1. Se abre el Sheet "Sección destacada" (`DrawerSeccionDestacada`).
2. Al presionar el lápiz de una tarjeta, se abre `GridModal` (modal de edición de tarjeta).
3. El segundo modal se renderiza **debajo** del Sheet: queda oculto detrás del modal principal, los campos quedan inutilizables.

### Comportamiento esperado
- Cada modal nuevo aparece **por encima del anterior** (modal principal → secundario → terciario).
- El overlay/backdrop de cada modal respeta el orden de capas.
- Todos los elementos del segundo modal son interactivos; el modal padre queda detrás y no interfiere.

### Causas (relevado completo)
1. **Escala de z-index inconsistente e invertida (principal):**

   | Superficie | z-index | Se abre desde | Estado |
   |---|---|---|---|
   | Sheet (`src/components/ui/sheet.tsx:60,68`) | backdrop 120 / panel 121 | página (sin portal, render inline) | base del flujo |
   | `GridModal` (`src/components/admin/design/GridModal.tsx:152`) | 60 | dentro del Sheet (portal a body) | **debajo del Sheet (60 < 121)** ❌ |
   | `SlideEditor` (`src/components/admin/carousel/SlideEditor.tsx:186`) | 60 | dentro del Wizard/DesignModal (portal) | ok por casualidad (60 > 50) |
   | `CarouselWizard` (`CarouselWizard.tsx:180`), `CarouselDesignModal.tsx:182`, `CarouselSettingsModal.tsx:75`, `ConfirmacionEliminarSeccion.tsx:22` | 50 | página (portales) | nivel base |
   | `EditorRecorte` (`src/components/imagen/EditorRecorte.tsx:73`) | 300 | dentro de `SubidaImagen` (portal) | ok por casualidad |

   Los portales están bien usados (`createPortal(document.body)`): el problema NO es de stacking context sino de jerarquía de valores (el drawer quedó en 120/121 mientras sus modales hijos quedaron en 50–60).
2. **Sin trampas de stacking context en ancestros:** verificado que los ancestros del Sheet (`WorkspaceDiseno`, `admin/layout.tsx`, layout raíz) no tienen `transform`, `filter`, `backdrop-filter`, `opacity` ni `will-change` que encierren su z-index. El Sheet se renderiza inline (sin portal), lo que lo expone a futuros ancestros con esas propiedades.
3. **Scroll-lock ya soporta anidamiento:** `useBloqueoScroll` (`src/hooks/use-bloqueo-scroll.ts`) usa conteo de referencias; no requiere cambios.
4. **Escape:** `GridModal` no tiene handler de Escape; el del Sheet escucha `window` sin verificar si hay un modal encima → Escape cerraría el Sheet por debajo del modal abierto (comportamiento preexistente; ver "Fuera de alcance").

### Decisiones tomadas
- **Sistema de capas por profundidad vía React Context** (no z-index arbitrarios ni props en cascada): cada modal lee su nivel del contexto, calcula su z-index y envuelve su contenido en nivel + 1. Los portales preservan el contexto de React, por lo que el anidamiento se propaga solo y el sistema es reutilizable para cualquier modal anidado del sistema.
- **Escala:** `CAPA_BASE_MODAL = 200`, `INCREMENTO_NIVEL = 100` → nivel 0 = 200, nivel 1 = 300, nivel 2 = 400, nivel 3 = 500. Queda por encima de la UI fija (sidebar 95, header 100, dropdowns 110) y por debajo de las capas de sistema (9999 de `RouteLoader`/`CookieModal`, intactas).
- **Sheet pasa a usar portal** (`createPortal` a `document.body`): unifica todos los modales en el stacking context raíz y lo blinda contra futuros ancestros con transform/filter.
- Panel del Sheet usa `zIndice + 1` sobre su backdrop (mantiene la relación backdrop < panel).

### Plan de solución
1. **Nuevo dominio `src/contextos/capas/`** (la carpeta `src/contextos/` no existe; se crea):
   - `constantes-capas.ts` — constantes `CAPA_BASE_MODAL = 200` e `INCREMENTO_NIVEL = 100` (solo constantes, permitido).
   - `contexto-capas.ts` — `ContextoCapas = createContext(0)` (default nivel 0 → no requiere provider raíz en el layout).
   - `use-capa.ts` — hook `useCapa()` (una función exportada) que devuelve `{ nivel, zIndice }` con `zIndice = CAPA_BASE_MODAL + nivel * INCREMENTO_NIVEL`.
2. **Regla del sistema:** cada modal lee `useCapa()`, usa `zIndice` en su overlay (y `zIndice + 1` en su panel si lo tiene) y envuelve su contenido con `<ContextoCapas.Provider value={nivel + 1}>` para que los modales anidados hereden nivel + 1 automáticamente (sin props, sin registro, sin contadores).
3. **Migraciones (8 componentes):**
   - `src/components/ui/sheet.tsx` — `useCapa()` (backdrop `zIndice`, panel `zIndice + 1`), envolver `children` con el provider nivel +1 y portar el Sheet a `document.body` (mantener `AnimatePresence` y el `useBloqueoScroll` actual).
   - `src/components/admin/design/GridModal.tsx` — `z-[60]` → `zIndice`; envolver el contenido del portal con el provider (para que `SubidaImagen` → `EditorRecorte` hereden).
   - `src/components/admin/carousel/SlideEditor.tsx` — ídem (`z-[60]` → `zIndice` + provider).
   - `src/components/admin/carousel/CarouselDesignModal.tsx`, `CarouselSettingsModal.tsx`, `CarouselWizard.tsx`, `ConfirmacionEliminarSeccion.tsx` — `z-50` → `zIndice` + provider (Wizard y DesignModal alojan `SlideEditor`).
   - `src/components/imagen/EditorRecorte.tsx` — `z-[300]` → `zIndice` (queda en 300 standalone, 400 dentro de GridModal en el Sheet).
4. **Sin cambios necesarios:** `HomeSectionsDesign.tsx`, `DrawerSeccionDestacada.tsx`, `DrawerUbicacion.tsx`, `PanelVistaPrevia.tsx` (el contexto se propaga solo a través de los Sheets ya migrados).
5. **Resultado en el flujo reportado:** Sheet = 200/201 → GridModal = 300 → EditorRecorte = 400; cualquier modal futuro anidado suma +100 sin tocar nada más.

### Fuera de alcance (se conservan intactos)
- Capas de sistema (`RouteLoader`, `CookieModal` en 9999) y UI fija (sidebar 95, header 100, dropdowns 110).
- Modales no anidados con escalas propias (`Manage*` 200, `ProductModal` 100, `ProviderModal`/`MovementModal` 150, `ConfirmDialog` 200): no comparten flujos con los migrados y quedan por debajo o al mismo nivel del base (200), sin cambios de comportamiento.
- La guarda de Escape del Sheet (cierra aunque haya un modal encima): comportamiento preexistente; opcional como mejora futura (p. ej., verificar el nivel activo antes de cerrar).

### Ejecución
- El orquestador crea primero los 3 archivos de `src/contextos/capas/` (define la interfaz del sistema; no se delega).
- Subagentes en paralelo (archivos sin solapamiento): A (`sheet.tsx` + portal), B (5 archivos de carousel: Wizard, DesignModal, SettingsModal, ConfirmacionEliminarSeccion, SlideEditor), C (`GridModal` + `EditorRecorte`).
- Agente verificador global (3+ subagentes): reglas AGENTS.md — español, una función exportada por archivo, ≤400 líneas (SlideEditor 365 y GridModal 309 quedan dentro; boy scout si exceden), imports `@/`, sin `any`, coherencia de la escala — y reparación.
- Comandos: `npm run lint` (no hay script `typecheck`; el build requiere BD).

### Verificación manual
1. **Flujo principal:** `/admin/design/contenido` → lápiz de "Sección destacada" → Sheet → lápiz de una tarjeta → `GridModal` visible por encima, backdrop sobre el del Sheet, campos interactivos, guardar/cerrar sin cerrar el Sheet.
2. **Crop:** abrir "Editar recorte" desde el GridModal dentro del Sheet → `EditorRecorte` (nivel 2 = 400) encima del GridModal.
3. **Carruseles:** wizard → `SlideEditor` encima del wizard; design modal → `SlideEditor` encima.
4. **Sheets solos** (Ubicación, Vista previa, configuraciones) siguen encima del contenido y su backdrop cierra al hacer click afuera.
5. **Regresión:** header/sidebar/dropdowns visibles bajo los overlays; `CookieModal`/`RouteLoader` siguen por encima de todo.
