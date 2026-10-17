import { aplicarWebhookPago } from "@/lib/pagos/aplicar-webhook-pago";
import { crearHandlerWebhookMP } from "@/lib/pagos/proveedores/mercadopago/crear-handler-webhook-mp";
import { procesarWebhookMP } from "@/lib/pagos/proveedores/mercadopago/procesar-webhook-mp";
import { resolverTenantPorHost } from "@/lib/tenants/resolver-tenant-host";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";

export const runtime = "nodejs";

export const POST = crearHandlerWebhookMP({
  resolverTenant: resolverTenantPorHost,
  procesarWebhook: (request, tenantId) =>
    conContextoTenantRuntime(tenantId, () => procesarWebhookMP(request, tenantId)),
  aplicarPago: (tenantId, pago) =>
    conContextoTenantRuntime(tenantId, () => aplicarWebhookPago(pago)),
});
