"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import type { EntradaActualizarSeccion } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarSeccionPersonalizada(id: string, datos: EntradaActualizarSeccion) {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, async (prisma) => {
    const seccion = await prisma.customSection.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!seccion) throw new Error("La sección no pertenece a la tienda activa");
    return prisma.customSection.update({ where: { id: seccion.id }, data: datos });
  });
}
