"use server";

import { obtenerMovimientos } from "@/lib/services/movimientos/obtener-movimientos";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";

export async function getMovements(pagina = 1, limite = 100) {
  const { tenantId } = await requiereUsuarioTenant();
  const paginaSegura = Number.isInteger(pagina) && pagina > 0 ? pagina : 1;
  const limiteSeguro = Number.isInteger(limite)
    ? Math.min(Math.max(limite, 1), 100)
    : 100;
  return obtenerMovimientos(tenantId, paginaSegura, limiteSeguro);
}
