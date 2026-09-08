import { prisma } from "@/lib/prisma";
import { Prisma } from "@/../generated/prisma/client";
import type { DatosGuardarProducto, ParOpcionValor } from "@/types/productos/opciones-producto";
import { sincronizarOpciones } from "@/lib/services/garment-options-service";
import { claveOpcionValor } from "@/lib/productos/normalizar-opciones";

type Tx = Prisma.TransactionClient;

const INCLUDE_VARIANTE = {
  size: true,
  color: true,
  optionValues: { include: { optionValue: { include: { option: true } } } },
} satisfies Prisma.GarmentVariantInclude;

async function crearVinculosVariante(
  tx: Tx,
  varianteId: string,
  resolver: Map<string, string>,
  opcionValores: ParOpcionValor[]
): Promise<void> {
  const datos = opcionValores
    .map((par) => ({ variantId: varianteId, optionValueId: resolver.get(claveOpcionValor(par)) }))
    .filter((d): d is { variantId: string; optionValueId: string } => Boolean(d.optionValueId));
  if (datos.length > 0) {
    await tx.garmentVariantOptionValue.createMany({ data: datos, skipDuplicates: true });
  }
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

export async function getGarmentById(tenantId: string, id: string) {
  return prisma.garment.findFirst({
    where: { id, tenantId },
    include: {
      category: true,
      subCategory: true,
      variants: { where: { tenantId }, include: INCLUDE_VARIANTE },
      supplier: { include: { contacts: { where: { tenantId, active: true } } } },
      images: { where: { tenantId }, orderBy: { order: "asc" } },
      opciones: { where: { tenantId }, include: { values: true }, orderBy: { position: "asc" } },
    },
  });
}

export async function createGarment(tenantId: string, datos: DatosGuardarProducto) {
  const categoria = await prisma.category.findFirst({ where: { id: datos.categoryId, tenantId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (datos.subCategoryId) {
    const subcategoria = await prisma.subCategory.findFirst({ where: { id: datos.subCategoryId, categoryId: datos.categoryId, tenantId }, select: { id: true } });
    if (!subcategoria) throw new Error("Subcategoría no encontrada");
  }
  if (datos.supplierId) {
    const proveedor = await prisma.provider.findFirst({ where: { id: datos.supplierId, tenantId }, select: { id: true } });
    if (!proveedor) throw new Error("Proveedor no encontrado");
  }

  const id = await prisma.$transaction(
    async (tx) => {
      const creado = await tx.garment.create({
        data: {
          tenantId,
          name: datos.name,
          price: datos.price,
          maxPrice: datos.maxPrice,
          cost: datos.cost,
          description: datos.description || null,
          categoryId: datos.categoryId,
          subCategoryId: datos.subCategoryId || null,
          supplierId: datos.supplierId || null,
          controlaStock: datos.controlaStock,
          active: datos.activo,
          etiquetas: datos.etiquetas.length ? (datos.etiquetas as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });
      const resolver = await sincronizarOpciones(tx, tenantId, creado.id, datos.opciones);
      for (const variante of datos.variants) {
        const creadaVariante = await tx.garmentVariant.create({
          data: {
            tenantId,
            garmentId: creado.id,
            stock: variante.stock,
            sku: variante.sku || null,
            priceOverride: variante.priceOverride,
          },
        });
        await crearVinculosVariante(tx, creadaVariante.id, resolver, variante.opcionValores);
      }
      return creado.id;
    },
    { timeout: 60000, maxWait: 60000 }
  );

  return prisma.garment.findUniqueOrThrow({ where: { id } });
}

export async function deleteGarment(tenantId: string, id: string) {
  const resultado = await prisma.garment.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Producto no encontrado");
  return resultado;
}

export async function updateGarmentWithDetails(
  tenantId: string,
  id: string,
  datos: DatosGuardarProducto
) {
  const producto = await prisma.garment.findFirst({ where: { id, tenantId }, select: { id: true, cost: true } });
  if (!producto) throw new Error("Producto no encontrado");
  const categoria = await prisma.category.findFirst({ where: { id: datos.categoryId, tenantId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (datos.subCategoryId) {
    const subcategoria = await prisma.subCategory.findFirst({ where: { id: datos.subCategoryId, categoryId: datos.categoryId, tenantId }, select: { id: true } });
    if (!subcategoria) throw new Error("Subcategoría no encontrada");
  }
  if (datos.supplierId) {
    const proveedor = await prisma.provider.findFirst({ where: { id: datos.supplierId, tenantId }, select: { id: true } });
    if (!proveedor) throw new Error("Proveedor no encontrado");
  }

  const cost = typeof datos.cost === "number" && !Number.isNaN(datos.cost) ? datos.cost : producto.cost;

  await prisma.$transaction(
    async (tx) => {
      await tx.garment.updateMany({
        where: { id, tenantId },
        data: {
          name: datos.name,
          price: datos.price,
          maxPrice: datos.maxPrice,
          cost,
          description: datos.description ?? "",
          categoryId: datos.categoryId,
          subCategoryId: datos.subCategoryId || null,
          supplierId: datos.supplierId || null,
          controlaStock: datos.controlaStock,
          active: datos.activo,
          etiquetas: datos.etiquetas.length ? (datos.etiquetas as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });

      const resolver = await sincronizarOpciones(tx, tenantId, id, datos.opciones);

      const variantesActuales = await tx.garmentVariant.findMany({ where: { tenantId, garmentId: id } });
      const idsEntrantes = datos.variants.filter((v) => v.id).map((v) => v.id as string);
      const idsAEliminar = variantesActuales.filter((v) => !idsEntrantes.includes(v.id)).map((v) => v.id);
      if (idsAEliminar.length > 0) {
        await tx.garmentVariant.deleteMany({ where: { tenantId, id: { in: idsAEliminar } } });
      }

      for (const variante of datos.variants) {
        const data = {
          stock: variante.stock,
          sku: variante.sku || null,
          priceOverride: variante.priceOverride,
        };
        if (variante.id) {
          await tx.garmentVariant.updateMany({ where: { id: variante.id, tenantId, garmentId: id }, data });
          await tx.garmentVariantOptionValue.deleteMany({ where: { variantId: variante.id } });
          await crearVinculosVariante(tx, variante.id, resolver, variante.opcionValores);
        } else {
          const creadaVariante = await tx.garmentVariant.create({
            data: {
              tenantId,
              garmentId: id,
              stock: variante.stock,
              sku: variante.sku || null,
              priceOverride: variante.priceOverride,
            },
          });
          await crearVinculosVariante(tx, creadaVariante.id, resolver, variante.opcionValores);
        }
      }
    },
    { timeout: 60000, maxWait: 60000 }
  );

  await prisma.garmentImage.deleteMany({ where: { tenantId, garmentId: id } });
  if (datos.images.length > 0) {
    await prisma.garmentImage.createMany({
      data: datos.images.map(({ url, publicId, order }) => ({
        garmentId: id,
        tenantId,
        srcImage: url,
        publicId: publicId ?? null,
        order,
      })),
    });
  }

  return prisma.garment.findFirst({ where: { id, tenantId } });
}
