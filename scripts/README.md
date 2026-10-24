# Scripts del proyecto

Los verificadores de transferencia y auditoría de relaciones entre bases fueron retirados:

- `verificar-transferencia-tenant.ts`
- `verificar-manifiesto-migracion-tenant.ts`
- `verificar-auditoria-relaciones-tenant.ts`

Probaban la herramienta histórica de copia de datos entre bases (`src/lib/tenants/migracion-datos`), que se eliminó durante la adopción de una base por tenant y del registro de conexiones en Logabyte Core. Ningún comando de `package.json` ni configuración de CI los ejecuta; este archivo registra su retiro. No se recrean sus módulos ni se sustituyen por pruebas ficticias.

Persisten scripts manuales de esa herramienta que importan los módulos eliminados: `inventariar-tenant-origen.ts`, `transferir-datos-tenant.ts` y archivos dentro de `tenants/transferencia/` y `tenants/auditar-relaciones-origen.ts`. No están registrados como comandos vigentes y actualmente no pueden ejecutarse por esos imports faltantes. `transferir-datos-tenant.ts` conserva una ruta de copia con modo `--ejecutar`; no se debe reparar ni ejecutar sin una revisión y autorización específicas. La migración vigente del esquema usa `prisma/migrations-base-unica/` y el flujo configurado para resolver conexiones desde Core.

También quedan utilidades y verificadores no registrados del antiguo registro local, como `cifrar-registro-local.ts`, `verificar-registro-local.ts`, `verificar-planificacion-migracion-todos.ts` y `verificar-silos-reales.ts`. Importan `src/lib/tenants/registry/cifrado-registro-local`, eliminado junto con ese proveedor. No se usan desde `package.json` ni desde el flujo Core actual; deben actualizarse contra una infraestructura de prueba aislada antes de volver a ofrecerse como verificaciones operativas.

El chequeo completo de `tsconfig.scripts.json` todavía falla en archivos históricos que importan `prisma-factory` o el antiguo módulo de aprovisionamiento, o que asumen una base compartida con columnas `tenantId`. Esos archivos tampoco se ejecutan desde `package.json`. En particular, `verificacion-aislamiento/limpiar-contexto.ts` contiene `deleteMany` para ese esquema retirado; no ejecutar ese verificador. El fallo de compilación evita que llegue a operar y no se ejecutó durante este trabajo.
