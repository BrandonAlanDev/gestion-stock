import "server-only";

import { proveedorMercadoPago } from "./mercadopago-proveedor";
import { crearProcesadorWebhookMP, firmaWebhookMPValida } from "./crear-procesador-webhook-mp";
import { ID_TIENDA } from "@/lib/tenants/obtener-tenant-publico";

/** Consulta la operación real después de verificar la notificación recibida. */
export const procesarWebhookMP = crearProcesadorWebhookMP({
  validarFirma: firmaWebhookMPValida,
  obtenerEstadoPago: (datos) =>
    proveedorMercadoPago.obtenerEstadoPago(ID_TIENDA, datos),
});
