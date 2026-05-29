import { prisma } from "@/lib/prisma";

export async function getColors() {
  return prisma.color.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

export async function createColor(name: string, hex?: string) {
  return prisma.color.create({ data: { name, hex } });
}