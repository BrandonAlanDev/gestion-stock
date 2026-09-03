import { prisma } from "@/lib/prisma";

export async function getSizeTypes(tenantId: string) {
  return prisma.sizeType.findMany({
    where: { tenantId },
    include: { sizes: { where: { tenantId } } },
    orderBy: { name: "asc" },
  });
}

export async function createSizeType(tenantId: string, name: string) {
  return prisma.sizeType.create({ data: { tenantId, name } });
}

export async function addSize(tenantId: string, sizeTypeId: string, value: string, order: number) {
  const tipo = await prisma.sizeType.findFirst({ where: { id: sizeTypeId, tenantId }, select: { id: true } });
  if (!tipo) throw new Error("Tipo de talle no encontrado");
  return prisma.size.create({
    data: { tenantId, value: value.toUpperCase(), order, sizeTypeId },
  });
}

export async function deleteSize(tenantId: string, id: string) {
  const resultado = await prisma.size.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Talle no encontrado");
  return resultado;
}

export async function deleteSizeType(tenantId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const tipo = await tx.sizeType.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!tipo) throw new Error("Tipo de talle no encontrado");
    await tx.size.deleteMany({ where: { tenantId, sizeTypeId: id } });
    await tx.sizeType.deleteMany({ where: { id, tenantId } });
  });
}

export async function updateSizeType(tenantId: string, id: string, name: string) {
  const resultado = await prisma.sizeType.updateMany({ where: { id, tenantId }, data: { name } });
  if (resultado.count === 0) throw new Error("Tipo de talle no encontrado");
  return resultado;
}

export async function updateSize(tenantId: string, id: string, value: string, order: number) {
  const resultado = await prisma.size.updateMany({
    where: { id, tenantId },
    data: { 
      value,
      order 
    },
  });
  if (resultado.count === 0) throw new Error("Talle no encontrado");
  return resultado;
}
