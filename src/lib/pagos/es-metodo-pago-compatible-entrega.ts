import type { MetodoEntregaCheckout } from "@/lib/pedidos/opciones-entrega";

/** El efectivo queda disponible únicamente para pedidos con retiro en tienda. */
export function esMetodoPagoCompatibleConEntrega(
  metodoPago: string,
  metodoEntrega: MetodoEntregaCheckout,
): boolean {
  return metodoPago !== "efectivo" || metodoEntrega === "RETIRO_TIENDA";
}
