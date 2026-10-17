import { conPrisma } from "@/lib/prisma";

export async function getColors(tenantId: string) {
  void tenantId;
  return conPrisma((prisma) => prisma.color.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  }));
}

export async function createColor(tenantId: string, name: string, hex?: string) {
  return conPrisma((prisma) =>
    prisma.color.create({ data: { name, hex } }),
  );
}
