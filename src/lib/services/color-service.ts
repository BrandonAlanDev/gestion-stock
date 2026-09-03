import { prisma } from "@/lib/prisma";

export async function getColors(tenantId: string) {
  return prisma.color.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });
}

export async function createColor(tenantId: string, name: string, hex?: string) {
  return prisma.color.create({ data: { tenantId, name, hex } });
}
