import "server-only";

import type { MetodoPagoId, PaymentProvider } from "@/lib/pagos/tipos";
import { proveedorMercadoPago } from "@/lib/pagos/proveedores/mercadopago/mercadopago-proveedor";
import { proveedorTransferencia } from "@/lib/pagos/proveedores/transferencia/transferencia-proveedor";

const proveedores: Record<MetodoPagoId, PaymentProvider> = {
  mercadopago: proveedorMercadoPago,
  transferencia: proveedorTransferencia,
};

/**
 * Devuelve la implementación concreta del proveedor de pagos para un método.
 * Es el único punto donde el checkout/la configuración conocen a los proveedores,
 * permitiendo agregar nuevos sin modificar el resto.
 */
export function obtenerProveedor(id: MetodoPagoId): PaymentProvider {
  const proveedor = proveedores[id];
  if (!proveedor) {
    throw new Error(`No existe un proveedor de pagos para: ${String(id)}`);
  }
  return proveedor;
}
