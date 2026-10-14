"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import type { EntradaActualizarContenidoPagina } from "@/types/paginas-personalizadas/entradas-acciones";

export async function actualizarContenidoPaginaPersonalizada(pageId: string, datos: EntradaActualizarContenidoPagina) {
  const { tenantId } = await requiereAdmin();
  return prisma.$transaction(async (transaccion) => {
    const pagina = await transaccion.customPage.findFirst({ where: { id: pageId, tenantId }, select: { id: true } });
    if (!pagina) throw new Error("La página no pertenece a la tienda activa");

    await transaccion.customPage.update({
      where: { id: pagina.id },
      data: {
        title: datos.title,
        subtitle: datos.subtitle,
        slug: datos.slug,
        isActive: datos.isActive,
      },
    });

    await transaccion.customSection.deleteMany({ where: { pageId, tenantId } });

    for (const seccion of datos.sections) {
      const creada = await transaccion.customSection.create({
        data: {
          tenantId,
          pageId,
          type: seccion.type,
          title: seccion.title,
          subtitle: seccion.subtitle,
          order: seccion.order,
          config: seccion.config,
        },
      });

      if (seccion.items?.length) {
        await transaccion.customSectionItem.createMany({
          data: seccion.items.map((elemento) => ({
            tenantId,
            sectionId: creada.id,
            title: elemento.title,
            description: elemento.description,
            image: elemento.image,
            icon: elemento.icon,
            link: elemento.link,
            order: elemento.order,
            config: elemento.config,
          })),
        });
      }
    }

    return transaccion.customPage.findFirst({
      where: { id: pageId, tenantId },
      include: {
        sections: {
          include: { items: true },
          orderBy: { order: "asc" },
        },
      },
    });
  });
}
