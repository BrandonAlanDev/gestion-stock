"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";
import type { EntradaCrearSeccion } from "@/types/paginas-personalizadas/entradas-acciones";

export async function crearSeccionPersonalizada(datos: EntradaCrearSeccion) {
  await requiereAdmin();
  return conPrisma(async (prisma) => {
    const pagina = await prisma.customPage.findFirst({ where: { id: datos.pageId }, select: { id: true } });
    if (!pagina) throw new Error("La página no pertenece a la tienda activa");
    return prisma.customSection.create({
      data: {
        pageId: datos.pageId,
        type: datos.type,
        title: datos.title,
        subtitle: datos.subtitle,
        order: datos.order ?? 0,
        config: datos.config,
      },
    });
  });
}
