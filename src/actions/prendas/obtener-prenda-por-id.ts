"use server";

import { obtenerPrendaPorId as consultarPrendaPorId } from "@/lib/services/prendas/obtener-prenda-por-id";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { serializarDatos as serializeData } from "@/lib/utilidades/serializar-datos";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

export async function obtenerPrendaPorId(id: string) {
  const { id: idTenant } = await requiereTenantActivo();
  const prenda = await consultarPrendaPorId(idTenant, id);
  return serializeData(prenda) as unknown as ProductoDetalleSerializado | null;
}
