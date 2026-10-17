import { conPrisma } from "@/lib/prisma";

export async function crearCategoria(tenantId: string, nombre: string) {
  return conPrisma((prisma) =>
    prisma.category.create({ data: { name: nombre } }),
  );
}
