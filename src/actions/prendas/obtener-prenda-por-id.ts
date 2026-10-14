"use server";

import { obtenerProductoCacheadoPorId } from "@/lib/cache/obtener-producto-cacheado-por-id";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { serializarDatos as serializeData } from "@/lib/utilidades/serializar-datos";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

export async function obtenerPrendaPorId(id: string) {
  const { id: idTenant } = await requiereTenantActivo();
  const funcionEnCache = obtenerProductoCacheadoPorId(idTenant, id);
  const prenda = await funcionEnCache();
  return serializeData(prenda) as unknown as ProductoDetalleSerializado | null;
}
