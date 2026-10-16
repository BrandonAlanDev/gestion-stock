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

## Arquitectura silo y transición de datos

- Se mantiene una sola aplicación Next.js. El runtime resuelve el tenant por hostname y usa una base MySQL independiente mediante `TenantRegistryProvider` y la fábrica de `src/lib/tenants/prisma-factory.ts`. El registro local cifrado está implementado; el transporte de Logabyte Core y su gestor de credenciales quedan pendientes de su contrato oficial.
- La resolución y selección de conexión ocurren exclusivamente en el servidor. Un dominio desconocido, tenant inactivo o referencia inválida debe fallar de forma cerrada; nunca uses una base por defecto ni aceptes un destino de conexión indicado por el cliente.
- `tenantId`, sus filtros y validaciones siguen presentes en el schema y en el código como protecciones de transición. No los elimines hasta que todas las tiendas estén copiadas y verificadas en sus bases independientes. No vuelvas a introducir un singleton Prisma conectado a una base compartida.
- No crees un `PrismaClient` por solicitud ni vuelvas a introducir la fachada global eliminada `src/lib/prisma.ts`. Usá `conPrismaTenant(tenantId, fn)` con un ID obtenido del registro del servidor; en solicitudes HTTP, resolvé el tenant por hostname antes de llamar esa función.
- Logabyte Core debe quedar como fuente externa de dominios, suscripciones/estado y referencias opacas de conexión. La incorporación dinámica sin cambios de variables de Vercel queda habilitada cuando se integre el gateway y el resolver de secretos; no presentes el archivo local como solución productiva dinámica.
- Antes de aplicar migraciones en bases existentes, compará DDL e historial, definí el baseline, aprovisionamiento, credenciales, traslado, validaciones y reversión. Todas las bases deben ejecutar el mismo schema y las mismas migraciones. `MULTI_TENANCY.md` detalla la transición.

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
