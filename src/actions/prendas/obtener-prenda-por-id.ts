"use server";

import { obtenerDetalleProductoCacheado } from "@/lib/services/prendas/obtener-detalle-producto-cacheado";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export async function obtenerPrendaPorId(id: string) {
  const { id: idTenant } = await requiereTenantActivo();
  return obtenerDetalleProductoCacheado(idTenant, id);
}
