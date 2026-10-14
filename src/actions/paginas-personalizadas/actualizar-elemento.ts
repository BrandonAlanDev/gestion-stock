"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import type { EntradaActualizarElemento } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarElementoSeccion(id: string, datos: EntradaActualizarElemento) {
  const { tenantId } = await requiereAdmin();
  const elemento = await prisma.customSectionItem.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!elemento) throw new Error("El elemento no pertenece a la tienda activa");
  return prisma.customSectionItem.update({ where: { id: elemento.id }, data: datos });
}
