"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";
import type { EntradaActualizarPagina } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarPaginaPersonalizada(id: string, datos: EntradaActualizarPagina) {
  await requiereAdmin();
  return conPrisma(async (prisma) => {
    const existente = await prisma.customPage.findFirst({ where: { id }, select: { id: true } });
    if (!existente) throw new Error("La página no pertenece a la tienda activa");
    return prisma.customPage.update({ where: { id: existente.id }, data: datos });
  });
}
