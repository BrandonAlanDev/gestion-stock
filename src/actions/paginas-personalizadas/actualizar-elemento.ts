"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import type { EntradaActualizarElemento } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarElementoSeccion(id: string, datos: EntradaActualizarElemento) {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, async (prisma) => {
    const elemento = await prisma.customSectionItem.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!elemento) throw new Error("El elemento no pertenece a la tienda activa");
    return prisma.customSectionItem.update({ where: { id: elemento.id }, data: datos });
  });
}
