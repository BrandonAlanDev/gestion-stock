import { prisma } from "@/lib/prisma";

export async function getSizeTypes() {
  return prisma.sizeType.findMany({
    include: { sizes: true },
    orderBy: { name: "asc" },
  });
}

export async function createSizeType(name: string) {
  return prisma.sizeType.create({ data: { name } });
}

export async function addSize(sizeTypeId: string, value: string, order: number) {
  return prisma.size.create({
    data: { value: value.toUpperCase(), order, sizeTypeId },
  });
}

export async function deleteSize(id: string) {
  return prisma.size.delete({ where: { id } });
}

export async function deleteSizeType(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.size.deleteMany({ where: { sizeTypeId: id } });
    await tx.sizeType.delete({ where: { id } });
  });
}

export async function updateSizeType(id: string, name: string) {
  return await prisma.sizeType.update({
    where: { id },
    data: { name },
  });
}

export async function updateSize(id: string, value: string, order: number) {
  return await prisma.size.update({
    where: { id },
    data: { 
      value,
      order 
    },
  });
}