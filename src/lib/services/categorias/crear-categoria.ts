import { prisma } from "@/lib/prisma";

export async function crearCategoria(tenantId: string, nombre: string) {
  return prisma.category.create({ data: { tenantId, name: nombre } });
}
