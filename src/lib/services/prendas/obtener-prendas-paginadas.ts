import { prisma } from "@/lib/prisma";
import { Prisma } from "@/../generated/prisma/client";
import { INCLUDE_VARIANTE } from "@/lib/services/prendas/incluir-variante";

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
    tenantId,
    active: true,
    ...(categoryId && { categoryId }),
    ...(subCategoryId && { subCategoryId }),
    ...(busqueda && { name: { contains: busqueda } }),
  };

  const [garments, total] = await Promise.all([
    prisma.garment.findMany({
      where,
      include: {
        images: { where: { tenantId }, orderBy: { order: "asc" } },
        variants: { where: { tenantId }, include: INCLUDE_VARIANTE, take: 5 },
        subCategory: true,
        category: true,
        opciones: { where: { tenantId }, include: { values: true }, orderBy: { position: "asc" } },
      },
      skip,
      take: limiteSeguro,
      orderBy: { createdAt: "desc" },
    }),
    prisma.garment.count({ where }),
  ]);

  return { garments, total, page: paginaSegura, limit: limiteSeguro };
}
