"use server";

import { getCachedProductById } from "@/lib/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { serializeData } from "@/lib/utils";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

export async function obtenerPrendaPorId(id: string) {
  const { id: idTenant } = await requiereTenantActivo();
  const funcionEnCache = getCachedProductById(idTenant, id);
  const prenda = await funcionEnCache();
  return serializeData(prenda) as unknown as ProductoDetalleSerializado | null;
}
