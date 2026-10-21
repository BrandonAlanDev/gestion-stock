# Auditoría de rendimiento de cargas

## Alcance

Se revisaron las rutas de tienda y administración, sus Server Actions, consultas Prisma y SQL, cachés por cliente, autenticación y render inicial. Se hicieron lecturas puntuales y `EXPLAIN` en el cliente de prueba configurado. No se ejecutaron `EXPLAIN ANALYZE` ni pruebas de carga; estas muestras aisladas no representan p50/p95 ni demuestran el beneficio de un índice.

| Solicitud local de prueba | Primera respuesta | Repetición inmediata |
| --- | ---: | ---: |
| Portada | 5,19 s | 23 ms |
| Catálogo | 4,15 s | 22 ms |

En una conexión nueva, resolver el dominio en Core tardó 1,23 s, verificar el acceso 338 ms y cinco consultas mínimas al tenant tardaron entre 320 y 345 ms cada una. Esta muestra precede a la eliminación de la verificación repetida. La latencia de red y los viajes secuenciales participan del arranque frío; se necesitan más muestras para cuantificar cada causa.

`EXPLAIN` en la base de prueba mostró un escaneo por índice `Garment_active_idx` para el catálogo y `Movement_type_createdAt_idx` para el dashboard. El listado administrativo anterior hacía `HashJoin` y `HashAgg` de todo el catálogo antes del `TopN` de 20 filas. El plan de la consulta paginada aplica `TopN` primero y luego busca variantes mediante `GarmentVariant_garmentId_idx`. Las estimaciones del optimizador usan estadísticas `pseudo`, así que no deben leerse como conteos reales.

## Cuellos de botella corregidos

| Camino | Hallazgo | Cambio |
| --- | --- | --- |
| Todas las páginas | El layout obtenía la sesión y la configuración volvía a obtenerla; después se repetía la lectura del usuario. | Sesión compartida durante la solicitud. La comprobación vigente del usuario sigue en el callback de Auth.js. |
| Acceso a cada cliente | Tras resolver el dominio en Core, se volvía a consultar el estado de ese mismo cliente. | La versión confirmada por dominio se reutiliza durante el mismo TTL de 30 segundos. La suspensión y la invalidación siguen verificadas por la prueba del registro. |
| Todas las páginas | La configuración ejecutaba un `upsert` antes de consultar la caché, incluso con datos cacheados. | Creación solo si falta la fila; la lectura usa la clave única `principal`. Los errores transitorios ya no se guardan como respuestas válidas en la caché de una hora. |
| Todas las páginas | La configuración traía el `homegrid` relacionado y luego todos los `homegrids`, duplicando la misma sección. | Una lectura de secciones, compartida con la configuración dentro de una sola conexión Prisma. |
| Tienda | `AppGate` ocultaba toda la página hasta el montaje del cliente. | El contenido se renderiza desde el servidor. |
| Portada | Los carruseles se pedían desde el navegador después de hidratar. | Los datos cacheados se entregan en el render inicial a ambos formatos de portada. |
| Dashboard | Se transferían todos los movimientos de seis meses para agruparlos en JavaScript. | SQL agrupa por mes y devuelve solo las filas mensuales. |
| Administración de productos | El conteo agrupaba y unía todas las variantes incluso sin filtro de stock. La consulta de filas agregaba todo el catálogo antes de paginar. La primera carga esperaba tres Server Actions del cliente. | Conteo directo y paginación antes de agregar variantes cuando no se filtra ni ordena por stock; datos iniciales obtenidos en paralelo en el servidor. |
| Movimientos | La consulta incluía productos, talles, opciones y campos no usados. La página administrativa esperaba una Server Action tras hidratar. | Selección de campos necesarios y render inicial en el servidor. |
| Categorías, talles y proveedores | Las listas se solicitaban tras montar cada página. | Datos iniciales cargados en el servidor; las actualizaciones conservan sus acciones existentes. |
| Lista de productos | Miniaturas servidas sin optimización de imagen. | Uso de `next/image` para orígenes compatibles. |

## Riesgos aún pendientes de medición

1. **Búsqueda con `contains` y `LIKE '%texto%'`:** catálogo, buscador y pedidos pueden recorrer muchas filas. Evaluar `EXPLAIN` con tamaños reales antes de decidir entre búsqueda de texto completo, índices o un cambio de experiencia.
2. **Índices de listados:** la migración `20261021010000_indices_listados` prepara `Garment(active, createdAt)` y `Pedido(userId, createdAt)` en el esquema y en el catálogo de Core. Aún falta medir con datos representativos si reducen el tiempo de las consultas y qué costo de escritura y almacenamiento agregan. No se aplicó DDL a ninguna base durante esta auditoría.
3. **Administración de productos con filtro u orden por stock:** la consulta debe agregar variantes antes de paginar y puede ser costosa con catálogos grandes. Medirla con `EXPLAIN ANALYZE` y decidir si conviene un resumen de stock mantenido transaccionalmente.
4. **Páginas personalizadas:** el listado administrativo carga todas las secciones y elementos de todas las páginas. Separar el resumen paginado del detalle al editar si el volumen real lo justifica.
5. **Configuración global:** el layout transporta secciones y grillas a rutas que solo usan tema, nombre y pie de página. Medir tamaño RSC y evaluar una consulta liviana global más datos completos por ruta; conservar invalidaciones y separación por cliente.

## Verificación necesaria con datos representativos

En una base de prueba de cada tamaño de cliente, registrar cantidad y duración de consultas Core y tenant, tamaño de respuesta RSC, y p50/p95 de navegación fría y caliente para portada, catálogo, producto, dashboard y administración de productos. Actualizar estadísticas y comparar planes con `EXPLAIN ANALYZE` antes de desplegar la migración de índices. No aplicar DDL a bases con datos sin comparar historial, respaldo y reversión.
