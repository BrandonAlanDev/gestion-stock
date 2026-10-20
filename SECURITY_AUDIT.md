# Auditoría de seguridad — 19 y 20 de octubre de 2026

## Alcance

Revisión estática de rutas HTTP, Server Actions, autenticación, selección de clientes, consultas SQL, carga de imágenes, pedidos, pagos, webhooks, dependencias y configuración de Next.js. Se revisaron los flujos relevantes en el código y se ejecutaron las verificaciones indicadas abajo. La auditoría no incluyó pruebas contra bases de datos, Logabyte Core ni Mercado Pago reales, ni un ensayo de penetración sobre un despliegue.

## Hallazgos corregidos

| Riesgo | Hallazgo | Corrección |
| --- | --- | --- |
| Crítico | Next.js 15.2.8 quedó por debajo de las versiones con parches de seguridad de 2026. | Actualización a 15.5.28 y del paquete ESLint correspondiente. [Aviso oficial](https://nextjs.org/blog/nextjs-security-update-october-14-2026). |
| Crítico | `next-auth` beta.30 y su adaptador incluían avisos de Auth.js, entre ellos comprobaciones de autenticación que podían fallar abiertas ante errores de configuración. | Actualización a beta.32 y adaptador 2.11.3. |
| Alto | El conector MariaDB y componentes de Prisma tenían avisos sobre transporte de credenciales, inyección SQL y agotamiento de recursos. | Actualización de MariaDB a 3.5.4 y de los paquetes Prisma a 7.10.1. |
| Alto | La conciliación de Mercado Pago comparaba referencia, monto y moneda, pero no comprobaba que el pago perteneciera a la preferencia creada para el pedido. | Se consulta la orden comercial, se comprueba que contiene el pago y se exige que su preferencia coincida con la guardada en el pedido. La acción de confirmación también exige la referencia exacta antes de aplicar un pago. |
| Alto | Una suspensión o cambio de cliente en Core podía quedar oculto indefinidamente por entradas válidas en caché. | Las resoluciones de dominio, ID y estado vencen a los 30 segundos. Ante un fallo de Core después del vencimiento, la operación falla cerrada. |
| Medio | La acción pública de configuración entregaba carruseles y secciones destacadas desactivadas. | Se filtran antes de devolver la respuesta a visitantes y usuarios comunes; los administradores conservan la vista completa. |
| Medio | El webhook aceptaba notificaciones sin comprobar firma cuando faltaba `MP_WEBHOOK_SECRET` fuera de producción. | Se rechazan en todos los entornos. |
| Medio | Faltaban cabeceras HTTP de protección básicas. | Se agregaron `nosniff`, protección contra marcos, política de referente y restricciones de permisos del navegador. |

Las dependencias transitivas `postcss`, `nanoid` y `source-map-js` se fijaron mediante `overrides` a versiones corregidas. `npm audit --omit=dev` informó **0 avisos** después de los cambios.

## Riesgos y verificaciones pendientes

- El informe completo de `npm audit` todavía informa **5 avisos altos** en la cadena de `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. Afectan a herramientas de desarrollo. La corrección sugerida por npm degrada `eslint-config-next` a la rama 14, incompatible con la rama 15 usada por la aplicación; se conserva la configuración actual hasta que el proveedor publique una solución compatible.
- El acceso a un cliente suspendido puede seguir habilitado durante el plazo de caché de hasta 30 segundos para operaciones nuevas. Una revocación inmediata exige invalidar la caché de todos los procesos o reiniciarlos.
- Verificar en un entorno de ensayo la conexión a Core, una compra real de Checkout Pro, el webhook firmado, la suspensión de un cliente y la rotación de credenciales. No se aplicaron migraciones ni se modificaron bases de datos.
- La compilación de producción finalizó correctamente. Next.js emitió advertencias de compatibilidad de `jose` con Edge Runtime y de uso de `<img>` en el panel; no impidieron el build y no se comprobó un fallo de seguridad derivado de ellas.

## Comprobaciones ejecutadas

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run verificar:core`
- `scripts/verificar-registro-tenant.ts`
- `scripts/verificar-aplicacion-webhook-pago.ts`
- `scripts/verificar-procesamiento-webhook-mp.ts`
- `npm audit --omit=dev`
- `npm audit`
- `git diff --check`
