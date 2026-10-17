import { crearHandlerCronExpirarPedidos } from "@/lib/pedidos/crear-handler-cron-expirar-pedidos";
import { expirarPedidosPendientesTenant } from "@/lib/pedidos/expirar-pedidos-pendientes";
import { obtenerProveedorRegistroTenant } from "@/lib/tenants/registry/proveedor-registro";

export const dynamic = "force-dynamic";

/** Endpoint interno para que el scheduler expire reservas dentro de cada silo activo. */
export const GET = crearHandlerCronExpirarPedidos({
  obtenerSecreto: () => process.env.CRON_SECRET,
  listarTenants: () => obtenerProveedorRegistroTenant().listarTenants(),
  expirarPedidos: expirarPedidosPendientesTenant,
});
