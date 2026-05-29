import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";

export async function getGarmentsPaginated(
  page: number,
  limit: number,
  categoryId?: string,
  search?: string
) {
  const skip = (page - 1) * limit;
  const where: Prisma.GarmentWhereInput = {
    active: true,
    ...(categoryId && { categoryId }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' },
    }),
  };

  const [garments, total] = await Promise.all([
    prisma.garment.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
        variants: {
          include: { size: true, color: true },
          take: 5,
        },
        subCategory: true,
        category: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.garment.count({ where }),
  ]);

  return { garments, total };
}

export async function getGarmentById(id: string) {
  return prisma.garment.findUnique({
    where: { id },
    include: {
      category: true,
      subCategory: true,
      variants: { include: { size: true, color: true } },
      supplier: { include: { contacts: { where: { active: true } } } },
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function createGarment(data: any) {
  return prisma.garment.create({ data });
}

export async function updateGarment(id: string, data: any) {
  return prisma.garment.update({ where: { id }, data });
}

export async function deleteGarment(id: string) {
  return prisma.garment.delete({ where: { id } });
}