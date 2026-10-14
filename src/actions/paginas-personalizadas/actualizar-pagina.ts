"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import type { EntradaActualizarPagina } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarPaginaPersonalizada(id: string, datos: EntradaActualizarPagina) {
  const { tenantId } = await requiereAdmin();
  const existente = await prisma.customPage.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!existente) throw new Error("La página no pertenece a la tienda activa");
  return prisma.customPage.update({ where: { id: existente.id }, data: datos });
}
