"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import type { EntradaCrearSeccion } from "@/types/paginas-personalizadas/entradas-acciones";

export async function crearSeccionPersonalizada(datos: EntradaCrearSeccion) {
  const { tenantId } = await requiereAdmin();
  const pagina = await prisma.customPage.findFirst({ where: { id: datos.pageId, tenantId }, select: { id: true } });
  if (!pagina) throw new Error("La página no pertenece a la tienda activa");
  return prisma.customSection.create({
    data: {
      tenantId,
      pageId: datos.pageId,
      type: datos.type,
      title: datos.title,
      subtitle: datos.subtitle,
      order: datos.order ?? 0,
      config: datos.config,
    },
  });
}
