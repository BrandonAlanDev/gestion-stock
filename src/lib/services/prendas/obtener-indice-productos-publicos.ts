import "server-only";

import { unstable_cache } from "next/cache";
import { conPrismaTenant } from "@/lib/prisma";
import { crearIndiceProductosPublicos } from "@/lib/productos/slugs-producto";

export async function obtenerIndiceProductosPublicos(tenantId: string) {
  return unstable_cache(
    async () => {
      const { productos, categorias } = await conPrismaTenant(tenantId, async (prisma) => {
        const [productos, categorias] = await Promise.all([
          prisma.garment.findMany({ where: { active: true }, select: { id: true, name: true, createdAt: true } }),
          prisma.category.findMany({ where: { active: true }, select: { name: true } }),
        ]);
        return { productos, categorias };
      });
      return crearIndiceProductosPublicos(productos, categorias.map((categoria) => categoria.name));
    },
    [`tenant:${tenantId}:product-slugs`],
    { revalidate: 300, tags: [`tenant:${tenantId}:products`, `tenant:${tenantId}:categories`] }
  )();
}
