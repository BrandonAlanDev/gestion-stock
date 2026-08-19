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
