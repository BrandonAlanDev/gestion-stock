import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function getColors(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.color.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  }));
}

export async function createColor(tenantId: string, name: string, hex?: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.color.create({ data: { tenantId, name, hex } }),
  );
}
