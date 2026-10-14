import prisma from "@/lib/prisma";

export async function crearMaterialesIniciales(tenantId: string) {
  for (const material of [
    { name: "Epóxi", description: "liviana y rígida" },
    { name: "Poliéster", description: "clásica y flexible" },
  ]) {
    await prisma.boardMaterialOption.upsert({
      where: { tenantId_name: { tenantId, name: material.name } },
      update: {},
      create: { ...material, tenantId },
    });
  }
}
