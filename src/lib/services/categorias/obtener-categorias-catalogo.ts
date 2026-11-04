import "server-only";

import { unstable_cache } from "next/cache";
import { conPrismaTenant } from "@/lib/prisma";
import type { CategoriaCatalogo } from "@/types/productos/catalogo-publico";

export async function obtenerCategoriasCatalogo(tenantId: string): Promise<CategoriaCatalogo[]> {
  return unstable_cache(
    async () => {
      const categorias = await conPrismaTenant(tenantId, (prisma) => prisma.category.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          _count: { select: { garments: { where: { active: true } } } },
          subCategories: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              _count: { select: { garments: { where: { active: true } } } },
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }));
      return categorias.map((categoria) => ({
        id: categoria.id,
        name: categoria.name,
        totalProductos: categoria._count.garments,
        subCategories: categoria.subCategories.map((subcategoria) => ({
          id: subcategoria.id,
          name: subcategoria.name,
          totalProductos: subcategoria._count.garments,
        })),
      }));
    },
    [`tenant:${tenantId}:catalog-categories`],
    { revalidate: 300, tags: [`tenant:${tenantId}:categories`, `tenant:${tenantId}:products`] }
  )();
}
