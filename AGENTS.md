### Idioma

- Todo el código, comentarios, mensajes de UI y nombres de archivos/carpetas deben estar en **español**.
- Excepciones (solo cuando el requisito técnico o el uso universal lo exige):
  - APIs de librerías y del sistema: `useSession`, `signIn`, `PrismaClient`, `fetch`, `Request`, `onDelete`, `GoogleProvider`, etc.
  - Modelos de base de datos de next-auth: `user`, `account`, `user_role` (nombres exactos exigidos por el adaptador).
  - Nombres universales compartidos por ambos idiomas: `footer`, `header`, `hero`, `layout`, `page`, `route`, `hook`, `middleware`, `proxy`, `server.js`, `next.config.ts`, etc.
  - Paquetes npm y nombres exportados por librerías de terceros (lucide-react, radix-ui, etc.).
- Regla ESLint activa: `@typescript-eslint/no-explicit-any: error` — prohibido usar `any`.

## Reglas de construcción (PERMANENTES — no eliminar, no saltar)

Estas reglas se agregan a las anteriores y son de cumplimiento obligatorio para TODO código nuevo y
toda modificación. No pueden borrarse, atenuarse ni saltarse nunca.

1. **Máximo UNA función exportada por archivo de código.** Un archivo (ts/tsx/js/jsx) puede exportar
   una sola función (solo se puede saltear esta reglas archivos que sean de tipo clase como los actions que tienen su crud y su logica del mismo tipo), componente React o hook. Si se necesitan más, se crean archivos adicionales.
   - Excluidos: archivos de constantes, tipos e interfaces (no exportan funciones).
   - Los closures internos de un componente (event handlers, callbacks) no cuentan como funciones del
     archivo; si un helper deja de ser trivial, se mueve a su propio archivo.
2. **Tamaño máximo de archivo: 400 líneas (objetivo: 300).** Ningún archivo de código puede superar
   las 400 líneas. Si lo supera, debe desglosarse en archivos con responsabilidad única.
3. **Regla del boy scout:** cualquier archivo existente que se modifique y quede fuera de límites
   (varias funciones exportadas o más de 400 líneas) debe desglosarse en la misma tanda de cambios.
4. Los documentos `.md` (documentación, planificación) no están sujetos a los límites de líneas.

## Organización por carpetas (PERMANENTE — no eliminar, no saltar)

Esta regla complementa las reglas de construcción y es de cumplimiento obligatorio para TODO
código nuevo y toda modificación. Su objetivo es mantener una arquitectura ordenada y predecible.

1. **Todo archivo de código debe vivir dentro de una carpeta que indique su dominio o propósito.**
   Está PROHIBIDO dejar archivos sueltos en la raíz de `src/` o en carpetas de dominio.
   - Si el archivo pertenece a un dominio existente, se coloca en su carpeta de dominio.
   - Si el dominio no existe, se crea una carpeta nueva con nombre descriptivo.
2. **Esquema de referencia de `src/`:**
   - `src/app/` — solo archivos de ruta de Next.js (`page`, `layout`, `route`, `loading`, `error`,
     `not-found`, `manifest`, `robots`, `sitemap`) y archivos propios del framework (`auth.ts`,
     `proxy.ts`). Los componentes de interfaz NO viven acá.
   - `src/components/<dominio>/` — componentes por dominio: `comunes/`, `ui/`, `inicio/`,
   - `src/actions/<dominio>/` — server actions por dominio: `clientes/`, `presupuestos/`,
     `mensajes/`, `administradores/`, `contacto/`, `sesion/`.
   - `src/lib/` — lógica compartida e infraestructura (`utilidades/`, `datos-estructurados/`,
     configuración, validaciones, prisma, etc.).
   - `src/hooks/`, `src/contextos/`, `src/types/` — hooks, contextos y tipos globales.
3. **Archivo nuevo:** si no existe la carpeta de su dominio, se crea. Está prohibido crear un
   archivo de código en un lugar que no sea su carpeta de dominio.
4. **Regla del boy scout aplicada a la organización:** si durante una modificación se detecta un
   archivo suelto (fuera de su carpeta de dominio), se lo mueve a su carpeta y se actualizan sus
   imports en la misma tanda de cambios.
5. **Los imports usan el alias `@/`** (mapeado a `src/`). Nunca se usan imports relativos para
   cruzar dominios; los relativos solo se permiten dentro de una misma carpeta si es estrictamente
   necesario.

## Uso de subagentes (OBLIGATORIO)

1. **Desglose obligatorio:** toda tarea o fase que se pueda desglosar en sub-tareas debe
   ejecutarse mediante subagentes (`task` tool). Nunca ejecutar directamente trabajo que
   pueda paralelizarse o delegarse.
2. **Prompts detallados:** cada subagente debe recibir el prompt más detallado y con el mayor
   contexto posible: objetivo, alcance exacto, archivos involucrados, patrones del proyecto,
   y TODAS las reglas de comportamiento de este documento (idioma, arquitectura, capas,
   límites de líneas, una función por archivo, imports con `@/`, etc.).
3. **Paralelización:** lanzar varios subagentes en paralelo cuando las sub-tareas sean
   independientes entre sí (un solo mensaje con múltiples llamadas a `task`).
4. **Agente verificador global:** cuando una fase requiera muchos subagentes (3 o más) y
   toque código compartido entre ellos, tras completar los subagentes se debe lanzar un
   agente verificador (`verificador`) que revise TODO el código producido en la fase,
   detecte fallas, incoherencias, violaciones de las reglas de este documento y archivos
   fuera de límites, y las repare. El verificador es el último paso de la fase y su
   aprobación es requisito para dar la fase por terminada. La unica exepción es solo si 
   es una armado de un plan no se va a requerir de un agente verificador global.
5. **Nunca delegar la coordinación:** la orquestación de subagentes, la definición de
   interfaces entre sub-tareas y la decisión final sobre resultados siempre las hace el
   agente principal, no los subagentes.
