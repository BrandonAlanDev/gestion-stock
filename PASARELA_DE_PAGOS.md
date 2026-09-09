# Pasarela de pagos multi-proveedor — gestió-stock

Este documento describe la pasarela de pagos ecommerce implementada en la plataforma.
La arquitectura separa tres capas: **CONFIGURACIÓN** (admin), **PAYMENT PROVIDER** (abstracción)
y **CHECKOUT** (navegación del cliente). Se reutiliza el patrón de Mercado Pago de `barber-turnos`
pero desacoplándolo para soportar múltiples proveedores.

---

## 1. Cómo funciona Mercado Pago en barber-turnos

`barber-turnos` (proyecto de referencia) usa Mercado Pago con **Checkout Pro** (`Preference`) y **OAuth**:

- OAuth con **PKCE S256** (`code_challenge`/`code_verifier`), `state` firmado con HMAC-SHA256 ligado al admin.
- Intercambio de `authorization_code` → `access_token`/`refresh_token` vía `fetch` a `https://api.mercadopago.com/oauth/token`.
- Tokens persistidos en BD (`configuracion_mercadopago`), con `mpUserId` y `nombreNegocio`.
- Webhooks con verificación `X-Signature` (`WebhookSignatureValidator`), consulta real al pago con `Payment.get`.
- No tenía renovación de tokens real (aunque guardaba `refresh_token`), ni abstracción de proveedores.

## 2. Qué se reutilizó conceptualmente

Se tomaron y mejoraron de `barber-turnos`:

- **Flujo OAuth con PKCE S256 y `state` firmado** (adaptado a multi-tenant).
- **Verificación `X-Signature`** de webhooks con tolerancia de ±5 min y *fail-closed* en producción.
- **Idempotencia** por `updateMany` sobre el estado (evita doble procesamiento).
- Jerarquía de archivos por dominio (`lib/`, `actions/`, `app/api/`) y convenciones del proyecto actual.
- En la app **gestion-stock** ya existía gran parte de la infraestructura MP (`src/lib/mercadopago/*`):
  OAuth, tokens, preferencias, renovación, etc. Ese código se conservó como **adaptador técnico** y se
  envolvió detrás del nuevo `PaymentProvider` (no se reescribió).

## 3. Arquitectura implementada

```
CONFIGURACIÓN (admin): activa/desactiva métodos, conecta cuentas (OAuth)
        ↓
PAYMENT PROVIDER (abstracción): PaymentProvider
        ├── proveedorMercadoPago   (Checkout Pro + OAuth + webhooks)
        └── proveedorTransferencia (instrucciones + pedido pendiente)
        ↓
CHECKOUT (cliente): consume solo métodos activos y disponibles, sin conocer proveedores
```

- `MetodoPagoId`: `"mercadopago" | "transferencia"`.
- El checkout pregunta "¿qué métodos están disponibles?" (`obtenerMetodosCheckout`), nunca "¿MP está activo?".
- Se mantiene la acción **WhatsApp** como flujo independiente (pedido por WhatsApp) al margen de la pasarela.

## 4. Archivos modificados

| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Modelos `MetodoPago` y `Payment` + relaciones en `Tenant` y `Pedido`. |
| `src/app/api/mercadopago/webhook/route.ts` | Delega en `procesarWebhookMP` + `aplicarWebhookPago`; devuelve 401 ante firma inválida. |
| `src/app/api/mercadopago/oauth/callback/route.ts` | Usa `proveedorMercadoPago.manejarCallback`. |
| `src/actions/pago/iniciar-pago.ts` *(nuevo)* | Creación de pedido + Payment + delegación al proveedor. |
| `src/actions/pago/confirmar-pago.ts` | Verifica contra la pasarela y aplica la confirmación con la capa compartida. |
| `src/components/cart/CartSidebar.tsx` | Reemplaza botones hardcodeados por "Continuar al checkout" + WhatsApp. |
| `src/components/admin/configuracion/PanelConfiguracion.tsx` | Item "Métodos de pago" ahora abre el nuevo drawer (antes `próximamente`). |
| `src/components/admin/configuracion/DrawersConfiguracion.tsx` | Nuevo drawer `"pagos"` con `<SeccionMetodosPago />`. |
| `src/components/admin/configuracion/tipos-panel.ts` | Agrega `"pagos"` a `ClaveDrawer`. |
| `src/components/ui/confirm-dialog.tsx` | Prop opcional `textoConfirmar` (retrocompatible). |

## 5. Archivos creados

- `src/lib/pagos/tipos.ts` — tipos de dominio (`PaymentProvider`, `DatosCrearPago`, etc.).
- `src/lib/pagos/constantes.ts` — definiciones de métodos conocidos.
- `src/lib/pagos/registro.ts` — factory `obtenerProveedor(id)`.
- `src/lib/pagos/obtener-metodos-disponibles.ts` — estado de métodos por comercio.
- `src/lib/pagos/filtrar-metodos-disponibles.ts` — filtro de métodos para checkout.
- `src/lib/pagos/aplicar-webhook-pago.ts` — aplicación idempotente de un webhook (Payment + Pedido + stock).
- `src/lib/pagos/proveedores/mercadopago/mercadopago-proveedor.ts` — `PaymentProvider` de MP.
- `src/lib/pagos/proveedores/transferencia/transferencia-proveedor.ts` — `PaymentProvider` de transferencia.
- `src/lib/pedidos/descontar-stock-pedido.ts` — descuento transaccional de stock por pedido.
- `src/actions/pago/iniciar-pago.ts`, `src/actions/pago/confirmar-pago.ts` (modificados).
- `src/actions/pagos/obtener-metodos-pago.ts`, `obtener-metodos-checkout.ts`, `activar-metodo.ts`, `guardar-config-metodo.ts`, `desconectar-metodo.ts`.
- `src/components/admin/pagos/SeccionMetodosPago.tsx`, `TarjetaMercadoPago.tsx`, `TarjetaTransferencia.tsx`.
- `src/components/checkout/CheckoutCliente.tsx`, `SelectorMetodoPago.tsx`, `ResumenPedido.tsx`, `PanelInstruccionesPago.tsx`.
- `src/app/(tienda)/checkout/page.tsx`.
- `prisma/migrations/20260909030000_metodos_pago_y_payment/migration.sql`.

## 6. Modelos Prisma modificados

- **`MetodoPago`** (nuevo): `tenantId`, `metodo`, `activo`, `config Json?`, `orden`. Único `[tenantId, metodo]`.
- **`Payment`** (nuevo): `tenantId`, `pedidoId`, `proveedor`, `metodo`, `externalId?`, `estado` (enum `PedidoEstadoPago`), `monto`, `moneda`, `metadata Json?`.
- **`Tenant`** → relaciones `metodosPago[]` y `payments[]`.
- **`Pedido`** → relación `payments[]` y campo `metodoPago` (preexistente) que ahora se setea al iniciar.

Se **reutilizan** los enums `PedidoEstado` y `PedidoEstadoPago` (no se crearon nuevos).

## 7. Migraciones generadas

`prisma/migrations/20260909030000_metodos_pago_y_payment/migration.sql` (crea `MetodoPago` y `Payment`).

> Nota: el script `build` del proyecto usa `prisma db push --accept-data-loss` en lugar de `migrate`.
> El archivo de migración documenta el cambio; al correr `npm run build` (o `prisma db push`), las tablas
> se crean en la base. Si preferís migraciones, aplicá `prisma migrate deploy` tras resolver el problema
> preexistente de la *shadow database* (TiDB no soporta `auto_increment` en la regeneración de una migración previa).

## 8. Variables de entorno necesarias

| Variable | Uso |
|---|---|
| `MP_CLIENT_ID` | Client ID de la app de Mercado Pago (OAuth). |
| `MP_CLIENT_SECRET` | Client Secret (OAuth) — solo servidor, nunca al cliente. |
| `MP_AUTH_BASE_URL` | Base de autorización OAuth por país (default `https://auth.mercadopago.com.ar`). |
| `MP_WEBHOOK_SECRET` | Secreto para validar la firma (`X-Signature`) de los webhooks. Sin él, *fail-closed* en producción. |
| `MP_REDIRECT_URI` o `NEXT_PUBLIC_APP_URL` | URL base para la URI de redirección OAuth y las `back_urls`. |
| `AUTH_SECRET` | Firma del `state` (HMAC). |

No se inventaron variables; son las ya usadas por la integración existente.

## 9. Cómo configurar Mercado Pago Developer

1. Ingresá a [mercadopago.com.ar/developers/panel/app](https://mercadopago.com.ar/developers/panel/app) y creá una aplicación.
2. En **Credenciales de la aplicación** copiá `Client ID` → `MP_CLIENT_ID` y `Client Secret` → `MP_CLIENT_SECRET`.
3. Generá el **secreto del webhook** (`MP_WEBHOOK_SECRET`) en la configuración de la aplicación y guardalo.
4. Configurá la URL de redirección (ver punto 10) y el webhook (ver punto 11).

## 10. Redirect URI

`https://<TU_DOMINIO>/api/mercadopago/oauth/callback`

- Se deriva de `MP_REDIRECT_URI` o `NEXT_PUBLIC_APP_URL`, o del host de la solicitud (multi-tenant).
- En desarrollo: `http://localhost:3000/api/mercadopago/oauth/callback`.
- Debe registrarse en el panel de la app de Mercado Pago (**URL de redirección**).
- El admin la ve en la tarjeta de Mercado Pago (sección *Métodos de pago*).

## 11. Webhook URL

`https://<TU_DOMINIO>/api/mercadopago/webhook?tenantId=<ID>`

- El `notification_url` de las preferencias la incluye automáticamente (`construir-preferencia.ts`).
- Se registra en la app de Mercado Pago como **URL de notificaciones/webhook** (sin el `tenantId`, que se añade dinámicamente).
- Verificala con `GET /api/mercadopago/webhook`.

## 12. Cómo probar OAuth

1. En el panel admin → *Ventas → Métodos de pago → Mercado Pago → Conectar* (o `/api/mercadopago/oauth/start`).
2. Autorizá en la cuenta de MP. Al volver, MP redirige al callback `/api/mercadopago/oauth/callback`.
3. La tarjeta debe indicar **Conectado**. Probá también: cancelar en la pantalla de MP (debe mostrar error de OAuth), reconectar y desconectar.

## 13. Cómo probar pagos

1. Como cliente con sesión iniciada, añadí productos al carrito → *Continuar al checkout*.
2. Seleccioná **Mercado Pago** y *Continuar con el pago* → redirige al checkout de MP.
3. Probá con credenciales de prueba (token `TEST-...`) para el flujo *sandbox*.
4. Al volver a `/pago/exito`, el pedido se verifica contra MP. La confirmación real la da el webhook.
5. **Transferencia bancaria**: activala en admin, configurá las instrucciones; en el checkout el pago queda PENDIENTE con instrucciones.

## 14. Cómo probar webhooks

- Con MP configurado, al aprobar un pago el webhook llega a `/api/mercadopago/webhook?tenantId=...`.
- Verificá que: `Payment` → APROBADO, `Pedido` → CONFIRMADO y el stock se descuente una sola vez.
- Duplicá la notificación (enviá el mismo payload dos veces) → no debe descontar stock dos veces ni regresar estados.
- Sin `MP_WEBHOOK_SECRET` en producción, el webhook se rechaza (fail-closed).

## 15. Cómo funciona el PaymentProvider

- `src/lib/pagos/tipos.ts` define la interfaz `PaymentProvider`:
  - `obtenerEstado(tenantId)`, `crearPago(datos)`, `obtenerEstadoPago(tenantId, externalId)`,
    `obtenerUrlConexion(...)`, `manejarCallback(...)`, `desconectar(tenantId)`.
- El **checkout** y la **configuración** dependen solo de la interfaz y del factory `obtenerProveedor(id)`.
- `proveedorMercadoPago` envuelve `src/lib/mercadopago/*` (OAuth, tokens, preferencias, `Payment.get`, renovación por comercio).
- `proveedorTransferencia` no contacta pasarelas: devuelve instrucciones y deja el pedido en PENDIENTE.
- La aplicación de un webhook (Payment + Pedido + stock) está en la capa compartida `aplicar-webhook-pago.ts`, no en el proveedor.

## 16. Cómo agregar otro proveedor (Stripe, MODO, PayPal)

1. Crear la carpeta `src/lib/pagos/proveedores/<proveedor>/` con un `PaymentProvider` que implemente la interfaz
   (crear el pago, consultar estado, manejar webhook, OAuth si aplica, etc.).
2. Agregar el `id` a `MetodoPagoId` en `src/lib/pagos/tipos.ts`.
3. Registrar la definición en `METODOS_PAGO_CONOCIDOS` (`src/lib/pagos/constantes.ts`).
4. Mapearlo en `proveedores` dentro de `src/lib/pagos/registro.ts`.
5. Para pagos online, sumar su ruta de webhook (p. ej. `/api/pagos/webhook/<proveedor>`) y su ruta de OAuth si aplica.
6. El checkout y la configuración lo mostrarán automáticamente sin cambios (solo consumen "métodos disponibles").

---

## Verificación

- `npx tsc --noEmit`: ✅ sin errores.
- ESLint sobre los archivos nuevos/modificados: ✅ sin warnings.
- Migración valida que el DDL coincide con el schema.
