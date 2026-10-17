import { crearHandlerCronExpirarPedidos } from "@/lib/pedidos/crear-handler-cron-expirar-pedidos";
import { expirarPedidosPendientes } from "@/lib/pedidos/expirar-pedidos-pendientes";

export const dynamic = "force-dynamic";

/** Endpoint interno para que el scheduler expire las reservas de la tienda. */
export const GET = crearHandlerCronExpirarPedidos({
  obtenerSecreto: () => process.env.CRON_SECRET,
  expirarPedidos: expirarPedidosPendientes,
});
