import { aplicarWebhookPago } from "@/lib/pagos/aplicar-webhook-pago";
import { crearHandlerWebhookMP } from "@/lib/pagos/proveedores/mercadopago/crear-handler-webhook-mp";
import { procesarWebhookMP } from "@/lib/pagos/proveedores/mercadopago/procesar-webhook-mp";
import { resolverTenantPorHost } from "@/lib/tenants/resolver-tenant-host";

export const runtime = "nodejs";

export const POST = crearHandlerWebhookMP({
  resolverTenant: resolverTenantPorHost,
  procesarWebhook: procesarWebhookMP,
  aplicarPago: aplicarWebhookPago,
});
