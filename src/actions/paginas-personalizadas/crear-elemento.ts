"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import type { EntradaCrearElemento } from "@/types/paginas-personalizadas/entradas-acciones";

export async function crearElementoSeccion(datos: EntradaCrearElemento) {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, async (prisma) => {
    const seccion = await prisma.customSection.findFirst({ where: { id: datos.sectionId }, select: { id: true } });
    if (!seccion) throw new Error("La sección no pertenece a la tienda activa");
    return prisma.customSectionItem.create({
      data: {
        sectionId: datos.sectionId,
        title: datos.title,
        description: datos.description,
        image: datos.image,
        icon: datos.icon,
        link: datos.link,
        order: datos.order ?? 0,
        config: datos.config,
      },
    });
  });
}
