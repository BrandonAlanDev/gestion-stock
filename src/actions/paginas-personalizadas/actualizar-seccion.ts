"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";
import type { EntradaActualizarSeccion } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarSeccionPersonalizada(id: string, datos: EntradaActualizarSeccion) {
  await requiereAdmin();
  return conPrisma(async (prisma) => {
    const seccion = await prisma.customSection.findFirst({ where: { id }, select: { id: true } });
    if (!seccion) throw new Error("La sección no pertenece a la tienda activa");
    return prisma.customSection.update({ where: { id: seccion.id }, data: datos });
  });
}
