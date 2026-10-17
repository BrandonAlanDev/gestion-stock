# Instrucciones para agentes — gestion-stock

Estas instrucciones rigen el repositorio completo. Consultá `ARCHITECTURE.md` para el mapa de capas y `README.md` para la puesta en marcha. Si la documentación difiere del comportamiento actual, verificá el código antes de cambiarlo y actualizá la documentación afectada.

## Proyecto y arquitectura

- Aplicación única de Next.js App Router con React, TypeScript estricto, Prisma y MySQL/MariaDB. La arquitectura elegida es un **monolito modular por capacidades de negocio** (catálogo, inventario, tienda, pedidos, pagos y configuración), con despliegue conjunto y una base de datos por cliente. Logabyte Core mantiene el registro central de dominios y conexiones; no introduzcas otros servicios separados por defecto.
- Respetá la organización existente: `src/app/` define rutas, layouts y handlers; `src/components/` contiene interfaz; `src/actions/` expone operaciones del servidor; `src/lib/` contiene servicios, acceso a datos e infraestructura. Dentro de esas áreas, agrupá por dominio. `src/hooks/`, `src/contextos/` y `src/types/` alojan piezas compartidas cuando corresponda.
- Las rutas y los componentes de interfaz coordinan la presentación. Las Server Actions y los route handlers validan entradas, aplican autenticación y autorización, coordinan la operación e invalidan caché cuando corresponde. Los servicios encapsulan lógica o consultas reutilizables y reciben sus dependencias de forma explícita. Una consulta simple no exige crear una capa o archivo adicional.
- Mantené las dependencias entre dominios explícitas. Extraé código a `src/lib/` compartido cuando tenga uso real en más de un dominio; evitá tanto la duplicación como las abstracciones preventivas. Evolucioná la estructura al tocar cada función, sin migraciones masivas ajenas a la tarea.
- Conservá las convenciones que impone Next.js (`page.tsx`, `layout.tsx`, `route.ts`, etc.) y los archivos de configuración necesarios en sus ubicaciones previstas. Usá `@/` para imports desde `src/` entre carpetas; los relativos locales son válidos si mantienen la lectura clara.

## Invariantes del negocio

- El servidor resuelve el dominio mediante Logabyte Core y obtiene allí la referencia de conexión del cliente; `DATABASE_URL` solo configura Prisma CLI para una base elegida explícitamente. Nunca aceptes destinos de conexión enviados por clientes. En operaciones administrativas usá `requiereAdmin()` o el control equivalente vigente.
- Validá IDs y relaciones recibidos del cliente antes de mutar datos. Mantené las claves de caché separadas por cliente y las invalidaciones coherentes con el alcance de cada base.
- Mantené atómicas las operaciones que cambian stock y movimientos. En pedidos, pagos y callbacks externos, preservá los controles existentes de autorización, consistencia e idempotencia; verificá su flujo antes de editarlo.
- `prisma/schema.prisma` es la fuente de verdad del modelo. No edites `generated/` ni `.next/` manualmente. No ejecutes cambios de esquema contra una base compartida sin conocer el entorno y el alcance.

## Bases por cliente y migraciones

- Se mantiene una sola aplicación Next.js y una base MySQL compatible por cliente. Reutilizá clientes Prisma por proceso y por identidad/version de conexión; no crees uno por solicitud. Fallá cerrado si Core no confirma el cliente activo.
- El baseline activo está en `prisma/migrations-base-unica/`. Aplicá las migraciones configuradas por `prisma.config.ts`.
- Antes de aplicar migraciones a una base con datos, compará su DDL e historial, definí respaldo y reversión. Nunca reinicies una base sin confirmar que es descartable.

## Código y alcance de los cambios

- Escribí textos de interfaz y comentarios nuevos en español. Para nombres de código, seguí la convención del módulo existente y conservá nombres exigidos por frameworks, bibliotecas o esquemas. No renombres símbolos existentes solo para uniformar el idioma.
- Respetá TypeScript estricto y ESLint; evitá `any` explícito. Validá datos externos en la frontera con los esquemas o patrones existentes.
- Un archivo debe tener una responsabilidad comprensible. Puede exportar varias funciones relacionadas y no tiene un máximo universal de líneas. Dividilo cuando mezcle responsabilidades, dificulte entender cambios o pruebas, o genere acoplamiento; no lo fragmentes solo para cumplir una cifra.
- Limitá cada cambio al problema pedido y a las correcciones necesarias para que funcione. Si detectás deuda no relacionada, registrala o mencionála sin convertir un ajuste pequeño en una refactorización extensa. Conservá el comportamiento público salvo que el pedido lo cambie.

## Subagentes

- La delegación es opcional. Usá subagentes cuando el usuario la solicite o las instrucciones aplicables lo indiquen, y el trabajo tenga partes independientes, alcance claro o análisis aislado que aporte valor. Para cambios locales o pasos secuenciales, trabajá directamente.
- Si delegás, definí objetivo, límites, archivos o dominios, entregable y verificaciones para cada subagente. Evitá ediciones simultáneas sobre los mismos archivos. El agente principal integra, revisa y responde por el resultado.
- La cantidad de subagentes y la revisión adicional dependen del riesgo y de la independencia de las tareas; no hay umbrales automáticos ni obligación de un agente verificador. Para revisión, probá primero con las herramientas y pruebas pertinentes.

## Verificación

- Revisá el diff y ejecutá la comprobación más pequeña que cubra el cambio. Para código TypeScript, usá el lint y la comprobación de tipos pertinentes (`npm run lint`, `npx tsc --noEmit`) según el alcance; para cambios de integración o build, considerá `npm run build` si el entorno está configurado.
- Si cambiás el esquema, verificá la migración activa y el acceso a una base de pruebas. No tomes el éxito del lint como prueba de integridad de datos.
- Para cambios solo de documentación, verificá rutas, comandos y coherencia con el código; no ejecutes una batería de pruebas sin relación con el cambio. Informá qué verificaste y cualquier limitación real.
