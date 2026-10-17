import "server-only";

import { proveedorMercadoPago } from "./mercadopago-proveedor";
import { crearProcesadorWebhookMP, firmaWebhookMPValida } from "./crear-procesador-webhook-mp";

/** Consulta la operación real después de verificar la notificación recibida. */
export const procesarWebhookMP = crearProcesadorWebhookMP({
  validarFirma: firmaWebhookMPValida,
  obtenerEstadoPago: (tenantId, datos) =>
    proveedorMercadoPago.obtenerEstadoPago(tenantId, datos),
});
