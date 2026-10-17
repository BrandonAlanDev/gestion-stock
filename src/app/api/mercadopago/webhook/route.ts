import { aplicarWebhookPago } from "@/lib/pagos/aplicar-webhook-pago";
import { crearHandlerWebhookMP } from "@/lib/pagos/proveedores/mercadopago/crear-handler-webhook-mp";
import { procesarWebhookMP } from "@/lib/pagos/proveedores/mercadopago/procesar-webhook-mp";

export const runtime = "nodejs";

export const POST = crearHandlerWebhookMP({
  procesarWebhook: procesarWebhookMP,
  aplicarPago: aplicarWebhookPago,
});
