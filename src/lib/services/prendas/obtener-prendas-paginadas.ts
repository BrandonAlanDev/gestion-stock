import { Prisma } from "@/../generated/prisma/client";
import { conPrismaTenant } from "@/lib/prisma";
import { SELECCION_PRODUCTO_PUBLICO } from "./seleccion-producto-publico";

export async function obtenerPrendasPaginadas(
  tenantId: string,
  page: number,
  limit: number,
  categoryId?: string,
  search?: string,
  subCategoryId?: string
) {
  const paginaSegura = Math.min(100, Math.max(1, Math.trunc(page) || 1));
  const limiteSeguro = Math.min(50, Math.max(1, Math.trunc(limit) || 20));
  const busqueda = search?.trim();
  const skip = (paginaSegura - 1) * limiteSeguro;
  const where: Prisma.GarmentWhereInput = {
    active: true,
    ...(categoryId && { categoryId }),
    ...(subCategoryId && { subCategoryId }),
    ...(busqueda && { name: { contains: busqueda } }),
  };

  return conPrismaTenant(tenantId, async (prisma) => {
    const [garments, total] = await Promise.all([
      prisma.garment.findMany({
        where,
        select: {
          ...SELECCION_PRODUCTO_PUBLICO,
          variants: { ...SELECCION_PRODUCTO_PUBLICO.variants, take: 5 },
        },
        skip,
        take: limiteSeguro,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      prisma.garment.count({ where }),
    ]);

    return { garments, total, page: paginaSegura, limit: limiteSeguro };
  });
}
