"use server";

import { obtenerMovimientos } from "@/lib/services/movimientos/obtener-movimientos";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getMovements(pagina = 1, limite = 100) {
  const { tenantId } = await requiereAdmin();
  const paginaSegura = Number.isInteger(pagina) && pagina > 0 ? pagina : 1;
  const limiteSeguro = Number.isInteger(limite)
    ? Math.min(Math.max(limite, 1), 100)
    : 100;
  return obtenerMovimientos(tenantId, paginaSegura, limiteSeguro);
}
