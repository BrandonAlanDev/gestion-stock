"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";
import type { EntradaActualizarElemento } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarElementoSeccion(id: string, datos: EntradaActualizarElemento) {
  await requiereAdmin();
  return conPrisma(async (prisma) => {
    const elemento = await prisma.customSectionItem.findFirst({ where: { id }, select: { id: true } });
    if (!elemento) throw new Error("El elemento no pertenece a la tienda activa");
    return prisma.customSectionItem.update({ where: { id: elemento.id }, data: datos });
  });
}
