# Runbook de restauración de un tenant

## Estado y alcance

Cada base tenant se respalda y restaura de forma independiente. Este repositorio no configura la retención, el cifrado, PITR ni la generación automática de backups del proveedor MySQL. Tampoco configura una copia de seguridad de Cloudinary. El operador debe completar esos servicios y sus objetivos RPO/RTO antes de considerar operativa una recuperación.

La restauración se hace en una base nueva. No sobrescribas el silo actual ni elimines el origen durante la validación. El registro de Core debe seguir apuntando al destino anterior hasta completar las comprobaciones.

## Preparación

1. Identificá el tenant por su ID estable y dominio registrado. Confirmá en el registro la referencia y versión vigentes; no copies credenciales en tickets, informes ni comandos visibles.
2. Consultá al proveedor MySQL cuál backup consistente se va a restaurar, su fecha, zona horaria, retención, cifrado y punto de recuperación. Anotá el identificador del backup y el objetivo RPO/RTO aprobado.
3. Confirmá el último release de aplicación, `prisma/schema.prisma`, checksums de `prisma/migrations/` y el estado de la migración del tenant. No uses `db push` para recuperar o alinear el esquema.
4. Pausá escrituras de la tienda afectada, incluidos pagos, webhooks y trabajos administrativos. Si se restaura un punto anterior al corte, definí cómo reconciliar las escrituras posteriores antes de reabrir.

## Transferencia interrumpida antes del corte

`npm run transferir:datos-tenant -- --ejecutar` copia las tablas en lotes y verifica conteos y hashes al terminar. La lectura del origen usa un snapshot `REPEATABLE READ`, pero las escrituras al destino no forman una transacción única. Si el proceso se interrumpe o falla, el destino puede contener parte de los datos; el comando no reanuda ni borra esa copia parcial y la siguiente planificación la rechazará porque espera un destino vacío.

El proveedor oficial de Logabyte Core todavía no está conectado. Este procedimiento describe la recuperación prevista; el comando actual solo puede resolver destinos disponibles en el proveedor de registro configurado.

1. Mantené el tenant en `PROVISIONING` y no cambies su ruta activa al destino incompleto. Conservá el origen como fuente de verdad y comprobá que las solicitudes comerciales siguen resolviendo al origen antes de reanudar sus escrituras.
2. Guardá el error, el tenant, la identidad del destino sin credenciales y el último modelo informado. No intentes repetir la ejecución sobre esa base ni limpiar tablas manualmente: hay relaciones entre modelos y este proyecto no implementa una operación de reinicio seguro.
3. Prepará una base nueva y vacía con el esquema y las migraciones requeridos. Actualizá la referencia de destino mientras el tenant permanezca en `PROVISIONING`; no reutilices la referencia anterior si todavía apunta a la base parcial.
4. Si se reanudaron escrituras en el origen, volvé a pausarlas antes de planificar. Ejecutá de nuevo `npm run transferir:datos-tenant -- --planificar`, revisá los conteos y la identidad del nuevo destino, y repetí la ejecución con las confirmaciones que correspondan a esos datos.
5. Activá el tenant solo después de una transferencia verificada y de las comprobaciones funcionales y de aislamiento. Mantené la base parcial sin tráfico hasta que el proveedor confirme una disposición segura; el proyecto no la elimina automáticamente.

## Restaurar y validar el destino

1. Pedile al proveedor MySQL que restaure el backup en una base nueva y aislada, con un usuario dedicado y permisos mínimos. No expongas credenciales administrativas al runtime comercial.
2. Registrá la nueva referencia como `PROVISIONING` en Core. No publiques todavía el destino nuevo como ruta activa.
3. Verificá conectividad TLS, servidor y nombre efectivo de la base. Comprobá que la conexión no comparte la base de otro tenant.
4. Compará las tablas, columnas, índices, `_prisma_migrations`, nombres y checksums contra el release esperado. Si hace falta aplicar migraciones, reconciliá primero el baseline y usá el runner confirmado `npm run migrar:silos`; no ejecutes migraciones destructivas sin revisar el SQL y autorizar ese cambio.
5. Compará conteos de tablas y revisá relaciones huérfanas/cruzadas, incluyendo pedidos, pagos, variantes, stock, movimientos y la tabla puente de opciones. Verificá que la fila `Tenant` local conserva el ID esperado.
6. Probá login y sesión, lectura y escritura de catálogo, pedido, actualización de stock, pago y webhook en una ventana controlada antes del corte. `npm run verificar:silos` solo inspecciona tenants activos y requiere al menos dos IDs; no verifica por sí sola el destino en estado `PROVISIONING` ni sustituye la validación funcional.
7. Revisá las URLs y `publicId` de imágenes. La base restaurada solo recupera referencias; los assets siguen viviendo en Cloudinary. Confirmá que los recursos todavía existen allí. Un `publicId` histórico sin propietario verificable no se debe mover ni borrar durante esta operación.

## Corte y reversión

1. Cambiá la referencia/version del tenant en Core solo después de aprobar las validaciones. Invalidá la caché del registro y los clientes Prisma de la instancia mediante el mecanismo acordado con Core; hoy la invalidación remota todavía no está implementada y la caché puede conservar metadatos hasta 30 segundos.
2. Reanudá escrituras y observá login, errores de DB, pedidos, pagos, stock y assets. Mantené el silo anterior y el backup de origen durante la ventana de reversión definida.
3. Si hay que revertir luego de aceptar escrituras en el silo nuevo, pausá otra vez las operaciones y reconciliá la diferencia desde el corte. Cambiar el registro al silo viejo sin esa conciliación pierde las escrituras nuevas.
4. Retirá la base anterior únicamente después de cerrar la ventana de reversión y comprobar que el backup puede restaurarse. La baja debe ejecutarla el proveedor/operador con confirmación explícita; este proyecto no borra bases automáticamente.

## Cloudinary

El respaldo MySQL no contiene los binarios de Cloudinary. Antes de habilitar una recuperación completa, definí con el proveedor de assets retención, recuperación de recursos eliminados e inventario de `publicId` por tenant. No borres assets al limpiar registros restaurados y no reutilices un `publicId` histórico compartido para un tenant distinto.

## Evidencia de recuperación

Conservá, en almacenamiento operativo restringido, el ID del backup, hora del punto de restauración, tenant, destino sin secretos, release y checksums, conteos por tabla, resultados de integridad, prueba funcional, hora del corte y decisión de reversión. Eliminá exportaciones temporales que contengan datos personales o tokens. Este repositorio no genera un archivo de backup ni registra esas evidencias automáticamente.
