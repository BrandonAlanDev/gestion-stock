import { crearHandlerCronExpirarPedidos } from "@/lib/pedidos/crear-handler-cron-expirar-pedidos";
import { expirarPedidosPendientesTenant } from "@/lib/pedidos/expirar-pedidos-pendientes";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";

export const dynamic = "force-dynamic";

/** Endpoint interno para que el scheduler expire las reservas de la tienda. */
export const GET = crearHandlerCronExpirarPedidos({
  obtenerSecreto: () => process.env.CRON_SECRET,
  listarTenants: async () => [{ tenant: await obtenerTenantPublico() }],
  expirarPedidos: expirarPedidosPendientesTenant,
});
