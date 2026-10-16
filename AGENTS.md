# Instrucciones para agentes — gestion-stock

Estas instrucciones rigen el repositorio completo. Para entender una zona concreta, consultá el código y la documentación pertinente: `ARCHITECTURE.md` para el mapa de capas, `MULTI_TENANCY.md` para aislamiento y `README.md` para puesta en marcha. Si difieren del comportamiento actual, verificá el código antes de cambiarlo y actualizá la documentación afectada.

## Proyecto y arquitectura

- Aplicación única de Next.js App Router con React, TypeScript estricto, Prisma y MySQL/MariaDB. La arquitectura elegida es un **monolito modular por capacidades de negocio** (catálogo, inventario, tienda, pedidos, pagos, configuración y tenants), con despliegue conjunto y límites de dominio claros. No introduzcas servicios separados por defecto.
- Respetá la organización existente: `src/app/` define rutas, layouts y handlers; `src/components/` contiene interfaz; `src/actions/` expone operaciones del servidor; `src/lib/` contiene servicios, acceso a datos e infraestructura. Dentro de esas áreas, agrupá por dominio. `src/hooks/`, `src/contextos/` y `src/types/` alojan piezas compartidas cuando corresponda.
- Las rutas y los componentes de interfaz coordinan la presentación. Las Server Actions y los route handlers validan entradas, aplican autenticación y autorización, coordinan la operación e invalidan caché cuando corresponde. Los servicios encapsulan lógica o consultas reutilizables y reciben sus dependencias de forma explícita. Una consulta simple no exige crear una capa o archivo adicional.
- Mantené las dependencias entre dominios explícitas. Extraé código a `src/lib/` compartido cuando tenga uso real en más de un dominio; evitá tanto la duplicación como las abstracciones preventivas. Evolucioná la estructura al tocar cada función, sin migraciones masivas ajenas a la tarea.
- Conservá las convenciones que impone Next.js (`page.tsx`, `layout.tsx`, `route.ts`, etc.) y los archivos de configuración necesarios en sus ubicaciones previstas. Usá `@/` para imports desde `src/` entre carpetas; los relativos locales son válidos si mantienen la lectura clara.

## Invariantes del negocio

- El `tenantId` autorizado se obtiene en el servidor, nunca de un valor del cliente como prueba de autorización. En fronteras públicas usá los controles de tenant activo; en operaciones administrativas usá `requiereAdmin()` o el control equivalente vigente.
- Toda consulta o mutación de datos de negocio debe quedar acotada al tenant, incluida la validación de IDs y relaciones recibidos del cliente. Los servicios reciben el `tenantId` explícito. Conservá el tenant en claves de caché, almacenamiento del cliente y rutas de Cloudinary. Consultá `MULTI_TENANCY.md` al modificar estas rutas.
- Mantené atómicas las operaciones que cambian stock y movimientos. En pedidos, pagos y callbacks externos, preservá los controles existentes de autorización, consistencia e idempotencia; verificá su flujo antes de editarlo.
- `prisma/schema.prisma` es la fuente de verdad del modelo. No edites `generated/` ni `.next/` manualmente. No ejecutes cambios de esquema contra una base compartida sin conocer el entorno y el alcance.

## Arquitectura objetivo del próximo sprint (todavía no implementada)

- Se mantendrá una sola aplicación Next.js, pero se migrará a **una base de datos por tenant**. Una base central funcionará como directorio: a partir del dominio normalizado resolverá la identidad del tenant, su estado y la referencia a su base de datos. Los datos operativos de cada tienda residirán en su propia base.
- La resolución y selección de la conexión ocurrirán exclusivamente en el servidor, antes de consultar datos del tenant. Un dominio desconocido, inactivo o sin base válida debe fallar de forma cerrada; nunca debe usar una base por defecto ni aceptar un destino de conexión indicado por el cliente.
- Hasta completar la migración, siguen vigentes el `tenantId`, los filtros, las validaciones y el `PrismaClient` compartido actuales. No elimines estas protecciones ni presentes la arquitectura objetivo como comportamiento existente.
- Cuando se implemente, centralizá el acceso a la base del tenant detrás de una interfaz explícita. Diseñá el ciclo de vida y los límites de las conexiones por tenant; evitá crear un cliente y un pool nuevos por solicitud. Mantené la identidad del tenant en autorización, caché, almacenamiento y assets aunque cambie su base física.
- Antes del corte, definí y verificá el esquema del directorio central, la ubicación de usuarios y sesiones, el manejo de credenciales, el aprovisionamiento y las migraciones por tenant, el traslado de datos, la reversión y las pruebas de aislamiento. `MULTI_TENANCY.md` detalla la transición prevista.

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
- Si cambiás aislamiento multi-tenant, ejecutá `npm run verificar:aislamiento` con una base de pruebas configurada y comprobá los casos afectados. No tomes el éxito del lint como prueba de seguridad entre tenants.
- Para cambios solo de documentación, verificá rutas, comandos y coherencia con el código; no ejecutes una batería de pruebas sin relación con el cambio. Informá qué verificaste y cualquier limitación real.
