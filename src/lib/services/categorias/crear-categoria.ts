import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function crearCategoria(tenantId: string, nombre: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.category.create({ data: { name: nombre } }),
  );
}
