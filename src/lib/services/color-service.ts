import { conPrismaTenant } from "@/lib/prisma";

export async function getColors(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.color.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  }));
}

export async function createColor(tenantId: string, name: string, hex?: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.color.create({ data: { name, hex } }),
  );
}
