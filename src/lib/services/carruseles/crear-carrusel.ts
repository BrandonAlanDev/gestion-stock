import { prisma } from "@/lib/prisma";
import type { EntradaCrearCarrusel } from "@/lib/services/carruseles/tipos";
import type { Prisma } from "../../../../generated/prisma/client";

export async function crearCarrusel(tenantId: string, datos: EntradaCrearCarrusel) {
  const configuracion = await prisma.pageConfig.findUnique({
    where: { tenantId },
    select: { id: true },
  });
  if (!configuracion) throw new Error("La configuración de la tienda no existe");
  return prisma.carousel.create({
    data: {
      tenantId,
      type: datos.type,
      title: datos.title,
      active: datos.active,
      order: datos.order,
      settings: datos.settings as Prisma.InputJsonValue | undefined,
      pageConfigId: configuracion.id,
      slides: {
        create: datos.slides.map((diapositiva) => ({
          ...diapositiva,
          tenantId,
          config: diapositiva.config as Prisma.InputJsonValue | undefined,
        })),
      },
    },
    include: { slides: { where: { tenantId }, orderBy: { order: "asc" } } },
  });
}
