# Migración desde una base antigua

Este migrador copia los datos de una base anterior, sin multitenencia, hacia un tenant nuevo de la base actual. La base de origen se abre únicamente para lectura y se conserva como respaldo.

## Configuración

Antes de ejecutar el migrador, definí estas variables en el entorno del proceso:

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión a la base actual que recibirá el tenant y sus datos. |
| `DATABASE_URL_ORIGEN` | Sí | Conexión a la base antigua que se leerá sin modificar. |
| `TENANT_NOMBRE` | Sí | Nombre visible del tenant que se creará. |
| `TENANT_SLUG` | Sí | Identificador en minúsculas, con números o guiones, por ejemplo `tienda-central`. |
| `TENANT_DOMINIO` | No | Dominio personalizado del tenant. Si se omite, queda sin dominio. |

Las dos conexiones deben apuntar a bases diferentes. Nunca agregues credenciales reales al repositorio ni compartas la salida completa de las variables de entorno.

Ejemplo de configuración en PowerShell usando valores de ejemplo:

```powershell
$env:DATABASE_URL = "mysql://USUARIO_DESTINO:CLAVE@SERVIDOR/BASE_DESTINO"
$env:DATABASE_URL_ORIGEN = "mysql://USUARIO_ORIGEN:CLAVE@SERVIDOR/BASE_ORIGEN"
$env:TENANT_NOMBRE = "Tienda Central"
$env:TENANT_SLUG = "tienda-central"
$env:TENANT_DOMINIO = "tienda.ejemplo.com"
```

## Ejecución segura

Sin argumentos, el migrador funciona en modo simulación: analiza la información y muestra el resumen previsto, pero no escribe en la base de destino.

```powershell
npm run migrar:base-antigua
```

Revisá el resumen de la simulación antes de continuar. Las URLs de conexión y sus credenciales no deben aparecer en los registros.

Para realizar la copia, repetí el comando con la confirmación explícita:

```powershell
npm run migrar:base-antigua -- --confirmar
```

`--confirmar` autoriza escrituras únicamente en la base indicada por `DATABASE_URL`. El programa solo ejecuta consultas de lectura sobre `DATABASE_URL_ORIGEN`. Como protección adicional ante errores operativos, se recomienda que esa URL utilice un usuario de MariaDB con permiso `SELECT` únicamente.

La validación previa rechaza una base de origen que ya tenga columnas `tenantId` y también detiene la migración si alguna columna antigua no existe en la tabla actual correspondiente. Así se evita aceptar por error una base ya multitenant o descartar datos silenciosamente por diferencias de schema.

## Relaciones históricas huérfanas

El modo normal aborta si una relación de colas o quillas apunta a una opción o tipo de tabla que ya no existe. No inventa padres ni omite datos automáticamente. Detecta la orientación A/B por los registros reales y rechaza casos ambiguos.

Si decidís excluir exclusivamente esas relaciones M:N inválidas, podés revisar este plan:

```powershell
npm run migrar:base-antigua -- --omitir-relaciones-huerfanas
```

Esto sigue siendo una simulación: no escribe en ninguna base. Genera un archivo JSON en `informes-migracion/` con tabla e IDs de cada relación excluida. Esta carpeta está ignorada por Git. Las relaciones originales permanecen en la base antigua.

Solo después de revisar el informe y aceptar esas exclusiones, la copia se habilita con ambos argumentos:

```powershell
npm run migrar:base-antigua -- --omitir-relaciones-huerfanas --confirmar
```

La opción no permite ignorar otras relaciones huérfanas ni enlaces internos rotos.

## Integridad de la copia

- El tenant recibe un CUID nuevo; los IDs de texto de registros importados se regeneran como UUID y los enteros se asignan por autoincremento.
- Se reconstruyen claves foráneas, enlaces a categorías/productos y referencias a carruseles en el orden de las secciones.
- Se preservan las URLs de imágenes y sus `publicId`: no se mueven ni copian archivos en Cloudinary.
- El origen se lee dentro de una transacción `RepeatableRead`, usando únicamente consultas de lectura de datos. Todas las tablas deben ser InnoDB.
- Mantené la aplicación antigua sin escrituras durante la migración y hasta el cambio de servicio: las modificaciones posteriores al inicio de la lectura no se importan.
- No vuelvas a ejecutar una importación exitosa con otro slug salvo que quieras otra copia. Un slug/dominio existente bloquea la repetición accidental.
- La simulación valida el plan, no ejecuta INSERT: el éxito definitivo solo se confirma al finalizar la transacción real del destino.

## Recuperación ante errores

Si la ejecución falla, la transacción revierte tanto el tenant como sus datos y la base antigua permanece sin cambios. Corregí la causa informada y repetí primero la simulación.
