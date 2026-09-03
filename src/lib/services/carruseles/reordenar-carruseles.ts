import { prisma } from "@/lib/prisma";

export async function reordenarCarruseles(tenantId: string, ids: string[]) {
  if (new Set(ids).size !== ids.length) throw new Error("El orden contiene carruseles repetidos");
  const existentes = await prisma.carousel.count({ where: { id: { in: ids }, tenantId } });
  if (existentes !== ids.length) throw new Error("Hay carruseles de otra tienda");
  return prisma.$transaction(async (transaccion) => {
    for (let indice = 0; indice < ids.length; indice++) {
      await transaccion.carousel.update({ where: { id: ids[indice] }, data: { order: 1000 + indice } });
    }
    for (let indice = 0; indice < ids.length; indice++) {
      await transaccion.carousel.update({ where: { id: ids[indice] }, data: { order: indice } });
    }
  });
}
