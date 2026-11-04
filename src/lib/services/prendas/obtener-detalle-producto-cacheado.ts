import "server-only";

import { unstable_cache } from "next/cache";
import { obtenerPrendaPorId } from "@/lib/services/prendas/obtener-prenda-por-id";
import { serializarDatos } from "@/lib/utilidades/serializar-datos";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

export async function obtenerDetalleProductoCacheado(tenantId: string, id: string) {
  return unstable_cache(
    async () => serializarDatos(await obtenerPrendaPorId(tenantId, id)) as unknown as ProductoDetalleSerializado | null,
    [`tenant:${tenantId}:product:${id}:detail`],
    { revalidate: 300, tags: [`tenant:${tenantId}:products`, `tenant:${tenantId}:product:${id}`] }
  )();
}
