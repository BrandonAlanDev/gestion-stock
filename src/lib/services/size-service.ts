import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function getSizeTypes(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.sizeType.findMany({
    where: {},
    include: { sizes: { where: {} } },
    orderBy: { name: "asc" },
  }));
}

export async function createSizeType(tenantId: string, name: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.sizeType.create({ data: { name } }),
  );
}

export async function addSize(tenantId: string, sizeTypeId: string, value: string, order: number) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const tipo = await prisma.sizeType.findFirst({ where: { id: sizeTypeId }, select: { id: true } });
    if (!tipo) throw new Error("Tipo de talle no encontrado");
    return prisma.size.create({
      data: { value: value.toUpperCase(), order, sizeTypeId },
    });
  });
}

export async function deleteSize(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.size.deleteMany({ where: { id } });
    if (resultado.count === 0) throw new Error("Talle no encontrado");
    return resultado;
  });
}

export async function deleteSizeType(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (tx) => {
    const tipo = await tx.sizeType.findFirst({ where: { id }, select: { id: true } });
    if (!tipo) throw new Error("Tipo de talle no encontrado");
    await tx.size.deleteMany({ where: { sizeTypeId: id } });
    await tx.sizeType.deleteMany({ where: { id } });
  }));
}

export async function updateSizeType(tenantId: string, id: string, name: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.sizeType.updateMany({ where: { id }, data: { name } });
    if (resultado.count === 0) throw new Error("Tipo de talle no encontrado");
    return resultado;
  });
}

export async function updateSize(tenantId: string, id: string, value: string, order: number) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.size.updateMany({
      where: { id },
      data: { value, order },
    });
    if (resultado.count === 0) throw new Error("Talle no encontrado");
    return resultado;
  });
}
