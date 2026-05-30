import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";

export async function getGarmentsPaginated(
  page: number,
  limit: number,
  categoryId?: string,
  search?: string,
  subCategoryId?: string
) {
  const skip = (page - 1) * limit;
  const where: Prisma.GarmentWhereInput = {
    active: true,
    ...(categoryId && { categoryId }),
    ...(subCategoryId && { subCategoryId }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };

  const [garments, total] = await Promise.all([
    prisma.garment.findMany({
      where,
      include: {
        //SKIP:1 para saltar el logo, TAKE:1 para traer solo la primera foto real (si existe)
        images: { skip: 1, take: 1, orderBy: { order: "asc" } },
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
export async function updateGarmentWithDetails(
  id: string,
  data: {
    name: string;
    price: number;
    cost: number;
    description?: string;
    categoryId: string;
    subCategoryId?: string | null;
    supplierId?: string | null;
    variants: Array<{
      id?: string;
      sku?: string;
      stock: number;
      sizeId?: string | null;
      colorId?: string | null;
      attributes?: any;
    }>;
    images: string[]; // URLs finales de Cloudinary
  }
) {
  const { name, price, cost, description, categoryId, subCategoryId, supplierId, variants, images } = data;

  // 1. Actualizar datos básicos
  await prisma.garment.update({
    where: { id },
    data: {
      name,
      price,
      cost,
      description,
      categoryId,
      subCategoryId: subCategoryId || null,
      supplierId: supplierId || null,
    },
  });

  // 2. Sincronizar variantes
  const currentVariants = await prisma.garmentVariant.findMany({ where: { garmentId: id } });
  const currentVariantIds = currentVariants.map((v) => v.id);
  const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id!);

  // Eliminar las que ya no están
  const idsToDelete = currentVariantIds.filter((vid) => !incomingVariantIds.includes(vid));
  if (idsToDelete.length > 0) {
    await prisma.garmentVariant.deleteMany({ where: { id: { in: idsToDelete } } });
  }

  // Actualizar existentes o crear nuevas
  for (const v of variants) {
    if (v.id) {
      await prisma.garmentVariant.update({
        where: { id: v.id },
        data: {
          sku: v.sku,
          stock: Number(v.stock),
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          attributes: v.attributes || null,
        },
      });
    } else {
      await prisma.garmentVariant.create({
        data: {
          garmentId: id,
          sku: v.sku,
          stock: Number(v.stock),
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          attributes: v.attributes || null,
        },
      });
    }
  }

  // 3. Sincronizar imágenes
  await prisma.garmentImage.deleteMany({ where: { garmentId: id } });
  if (images.length > 0) {
    await prisma.garmentImage.createMany({
      data: images.map((url, index) => ({
        garmentId: id,
        srcImage: url,
        order: index,
      })),
    });
  }

  // Retornar el producto actualizado (opcional)
  return prisma.garment.findUnique({ where: { id } });
}