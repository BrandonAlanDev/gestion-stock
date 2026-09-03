import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/../generated/prisma/client";

async function validarReferenciasVariantes(
  tenantId: string,
  variantes: Array<{ sizeId?: string | null; colorId?: string | null }>
): Promise<void> {
  const talles = [...new Set(variantes.map((variante) => variante.sizeId).filter((id): id is string => Boolean(id)))];
  const colores = [...new Set(variantes.map((variante) => variante.colorId).filter((id): id is string => Boolean(id)))];
  const [cantidadTalles, cantidadColores] = await Promise.all([
    prisma.size.count({ where: { tenantId, id: { in: talles } } }),
    prisma.color.count({ where: { tenantId, id: { in: colores } } }),
  ]);
  if (cantidadTalles !== talles.length) throw new Error("Talle no encontrado");
  if (cantidadColores !== colores.length) throw new Error("Color no encontrado");
}

export async function getGarmentsPaginated(
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
        variants: {
          where: { tenantId },
          include: { size: true, color: true },
          take: 5,
        },
        subCategory: true,
        category: true,
      },
      skip,
      take: limiteSeguro,
      orderBy: { createdAt: "desc" },
    }),
    prisma.garment.count({ where }),
  ]);

  return { garments, total, page: paginaSegura, limit: limiteSeguro };
}

export async function getGarmentById(tenantId: string, id: string) {
  return prisma.garment.findFirst({
    where: { id, tenantId },
    include: {
      category: true,
      subCategory: true,
      variants: { where: { tenantId }, include: { size: true, color: true } },
      supplier: { include: { contacts: { where: { tenantId, active: true } } } },
      images: { where: { tenantId }, orderBy: { order: "asc" } },
    },
  });
}

export async function createGarment(
  tenantId: string,
  data: Omit<Prisma.GarmentUncheckedCreateInput, "tenantId">
) {
  const categoria = await prisma.category.findFirst({ where: { id: data.categoryId, tenantId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (data.subCategoryId) {
    const subcategoria = await prisma.subCategory.findFirst({ where: { id: data.subCategoryId, categoryId: data.categoryId, tenantId }, select: { id: true } });
    if (!subcategoria) throw new Error("Subcategoría no encontrada");
  }
  if (data.supplierId) {
    const proveedor = await prisma.provider.findFirst({ where: { id: data.supplierId, tenantId }, select: { id: true } });
    if (!proveedor) throw new Error("Proveedor no encontrado");
  }
  const variantes = data.variants && "create" in data.variants && Array.isArray(data.variants.create)
    ? data.variants.create.map((variante) => ({ ...variante, tenantId }))
    : undefined;
  if (variantes) {
    await validarReferenciasVariantes(
      tenantId,
      variantes.map((variante) => ({
        sizeId: "sizeId" in variante ? variante.sizeId : undefined,
        colorId: "colorId" in variante ? variante.colorId : undefined,
      }))
    );
  }
  return prisma.garment.create({ data: { ...data, tenantId, ...(variantes ? { variants: { create: variantes } } : {}) } });
}

export async function deleteGarment(tenantId: string, id: string) {
  const resultado = await prisma.garment.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Producto no encontrado");
  return resultado;
}

export async function updateGarmentWithDetails(
  tenantId: string,
  id: string,
  data: {
    name: string;
    price: number;
    maxPrice?: number | null;
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
      attributes?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    }>;
    images: Array<{ url: string; publicId?: string | null; order: number }>;
  }
) {
  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images } = data;

  // 1. Actualizar datos básicos
  const producto = await prisma.garment.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!producto) throw new Error("Producto no encontrado");
  const categoria = await prisma.category.findFirst({ where: { id: categoryId, tenantId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (subCategoryId) {
    const subcategoria = await prisma.subCategory.findFirst({ where: { id: subCategoryId, categoryId, tenantId }, select: { id: true } });
    if (!subcategoria) throw new Error("Subcategoría no encontrada");
  }
  if (supplierId) {
    const proveedor = await prisma.provider.findFirst({ where: { id: supplierId, tenantId }, select: { id: true } });
    if (!proveedor) throw new Error("Proveedor no encontrado");
  }
  await validarReferenciasVariantes(tenantId, variants);
  await prisma.garment.updateMany({
    where: { id, tenantId },
    data: {
      name,
      price,
      maxPrice: typeof maxPrice === "number" ? maxPrice : null,
      cost,
      description,
      categoryId,
      subCategoryId: subCategoryId || null,
      supplierId: supplierId || null,
    },
  });

  // 2. Sincronizar variantes (transaccional y paralelo)
  await prisma.$transaction(async (tx) => {
    const currentVariants = await tx.garmentVariant.findMany({ where: { tenantId, garmentId: id } });
    const currentVariantIds = currentVariants.map((v) => v.id);
    const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id as string);

    const idsToDelete = currentVariantIds.filter((vid) => !incomingVariantIds.includes(vid));
    if (idsToDelete.length > 0) {
      await tx.garmentVariant.deleteMany({ where: { tenantId, id: { in: idsToDelete } } });
    }

    await Promise.all(
      variants.map((v) => {
        const data = {
          sku: v.sku,
          stock: Number(v.stock),
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          attributes: v.attributes ?? undefined,
        };
        if (v.id) {
          return tx.garmentVariant.updateMany({ where: { id: v.id, tenantId, garmentId: id }, data });
        }
        return tx.garmentVariant.create({ data: { tenantId, garmentId: id, ...data } });
      })
    );
  });

  // 3. Sincronizar imágenes
  await prisma.garmentImage.deleteMany({ where: { tenantId, garmentId: id } });
  if (images.length > 0) {
    await prisma.garmentImage.createMany({
      data: images.map(({ url, publicId, order }) => ({
        garmentId: id,
        tenantId,
        srcImage: url,
        publicId: publicId ?? null,
        order,
      })),
    });
  }

  // Retornar el producto actualizado (opcional)
  return prisma.garment.findFirst({ where: { id, tenantId } });
}
