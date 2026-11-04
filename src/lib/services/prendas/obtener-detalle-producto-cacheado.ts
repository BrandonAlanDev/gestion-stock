import "server-only";

import { unstable_cache } from "next/cache";
import { conPrismaTenant } from "@/lib/prisma";
import { obtenerPrendaPorId } from "@/lib/services/prendas/obtener-prenda-por-id";
import { serializarDatos } from "@/lib/utilidades/serializar-datos";
import type { ProductoDetalleSerializado, VarianteProductoDetalle } from "@/types/productos/detalle-producto";

type DetalleCacheado = Omit<ProductoDetalleSerializado, "variants"> & {
  variants: Array<Omit<VarianteProductoDetalle, "stock">>;
};

export async function obtenerDetalleProductoCacheado(tenantId: string, id: string) {
  const [detalle, stockActual] = await Promise.all([
    unstable_cache(
      async () => serializarDatos(await obtenerPrendaPorId(tenantId, id)) as unknown as DetalleCacheado | null,
      [`tenant:${tenantId}:product:${id}:detail`],
      { revalidate: 300, tags: [`tenant:${tenantId}:products`, `tenant:${tenantId}:product:${id}`] }
    )(),
    conPrismaTenant(tenantId, (prisma) => prisma.garment.findFirst({
      where: { id, active: true },
      select: { variants: { select: { id: true, stock: true } } },
    })),
  ]);
  if (!detalle || !stockActual) return null;

  const stockPorVariante = new Map(
    stockActual.variants.map((variante) => [variante.id, variante.stock]),
  );
  return {
    ...detalle,
    variants: detalle.variants.map((variante) => ({
      ...variante,
      stock: stockPorVariante.get(variante.id) ?? 0,
    })),
  } satisfies ProductoDetalleSerializado;
}
