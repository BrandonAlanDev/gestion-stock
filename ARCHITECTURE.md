# Arquitectura — Gestión Stock

La aplicación sigue siendo un monolito Next.js App Router con React, TypeScript estricto y Prisma. Se despliega una sola aplicación para varios clientes, con una base MySQL compatible por cliente. Logabyte Core conserva el registro central de dominios, estados y referencias de credenciales.

## Capas

- `src/app/`: rutas, layouts y handlers HTTP.
- `src/components/`: interfaz de tienda y administración.
- `src/actions/`: acciones del servidor con validación, permisos e invalidación de caché.
- `src/lib/`: servicios de catálogo, inventario, pedidos, pagos, configuración y conexión a datos.
- `src/lib/tenants/`: resolución de dominio, proveedores de catálogo Core, contexto de ejecución y administración de pools Prisma.
- `src/hooks/`, `src/contextos/` y `src/types/`: estado y tipos compartidos.

Las operaciones de inventario que cambian stock y movimientos se ejecutan en transacciones. Los flujos de pedidos y pagos validan monto, estado y referencias antes de confirmar una transición; los webhooks verifican su firma y las escrituras son idempotentes.

## Datos y autenticación

`prisma/schema.prisma` define el modelo local de cada cliente. `src/lib/tenants/registry/` consulta directamente las tablas de Core mediante `LOGABYTE_CORE_DATABASE_URL`. El proveedor filtra por producto activo, valida estado, instancia y versiones, descifra la URI solo en el servidor y exige insertar la auditoría antes de entregarla. Su cuenta SQL necesita acceso limitado al catálogo y comparte la clave maestra de cifrado de Core, por lo que cualquier cambio en ese esquema o cifrado debe coordinarse con esta aplicación. Las resoluciones de dominio, ID y estado, tanto positivas como negativas, vencen a los 30 segundos por proceso; el listado usa el mismo plazo. Las credenciales se guardan solo en memoria del servidor, separadas de los metadatos públicos y por identidad y versión de conexión. Una invalidación explícita o un fallo de conexión al abrir o usar la base descarta las respuestas cacheadas para el próximo intento. La suspensión o un cambio de configuración en Core se refleja automáticamente en un máximo de 30 segundos para operaciones nuevas, o antes si se invalida la caché de cada proceso. `src/lib/prisma.ts` reutiliza clientes Prisma por cliente y versión de credenciales. El encabezado `Host` determina el cliente de las peticiones públicas; las operaciones internas con un ID confiable lo seleccionan explícitamente.

Auth.js usa un adaptador que opera en la base del cliente. El JWT vincula usuario, cliente y dominio; el middleware protege rutas de gestión y el servidor vuelve a verificar autorización y pertenencia. Las claves y etiquetas de caché de datos incluyen el ID del cliente. El catálogo público selecciona solo campos de tienda y excluye productos inactivos; la configuración pública excluye carruseles y secciones destacadas desactivadas. Las consultas de movimientos requieren permisos de administrador.

## Migraciones

`prisma.config.ts` apunta a `prisma/migrations-base-unica/`. El ejecutor administrativo resuelve cada destino en Logabyte Core y entrega una URL temporal a Prisma CLI. Sin ese destino confirmado, los comandos de migración fallan cerrados. El catálogo de Logabyte Core provisiona bases nuevas con el mismo baseline. Las bases antiguas requieren una migración evaluada individualmente. Consultá [README.md](README.md).

## Integraciones

- Cloudinary almacena imágenes de productos y configuración.
- Mercado Pago maneja Checkout Pro y OAuth; el callback conserva estado firmado, PKCE y controles de origen. El webhook valida dominio y cliente, firma, monto, moneda y pedido antes de aplicar el pago.
- El cron de expiración usa `CRON_SECRET`, enumera clientes activos desde Core y libera reservas vencidas en cada base.

## Pedidos y envíos

El checkout guarda una instantánea de los productos, datos del comprador y dirección de entrega en la base activa del cliente. El número de pedido proviene de `NumeroPedido`, una secuencia local a cada base. Las direcciones guardadas pertenecen al usuario autenticado y no cambian pedidos ya creados. La administración gestiona estados, transportistas y seguimiento mediante acciones que validan permisos y relaciones en el servidor. La aprobación manual de una transferencia confirma la reserva de stock en la misma transacción; la confirmación de Mercado Pago conserva su flujo de webhook e idempotencia.

El envío a domicilio no tiene cotización automática: `costoEnvio` se registra en cero y el costo se coordina con la tienda. El pedido muestra esta condición antes del pago.
