import { prisma } from "@/lib/prisma";
import type { EntradaActualizarCarrusel } from "@/lib/services/carruseles/tipos";
import type { Prisma } from "../../../../generated/prisma/client";

export async function actualizarCarrusel(tenantId: string, datos: EntradaActualizarCarrusel) {
  const { id, slides, ...cambios } = datos;
  const existente = await prisma.carousel.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!existente) throw new Error("El carrusel no pertenece a la tienda activa");

  return prisma.$transaction(async (transaccion) => {
    if (Object.keys(cambios).length > 0) {
      await transaccion.carousel.update({
        where: { id },
        data: {
          ...cambios,
          settings: cambios.settings as Prisma.InputJsonValue | undefined,
        },
      });
    }
    if (slides) {
      await transaccion.carouselSlide.deleteMany({ where: { carouselId: id, tenantId } });
      await transaccion.carouselSlide.createMany({
        data: slides.map((diapositiva) => ({
          tenantId,
          carouselId: id,
          image: diapositiva.image,
          publicId: diapositiva.publicId,
          title: diapositiva.title,
          subtitle: diapositiva.subtitle,
          description: diapositiva.description,
          ctaText: diapositiva.ctaText,
          url: diapositiva.url,
          config: diapositiva.config as Prisma.InputJsonValue | undefined,
          order: diapositiva.order,
        })),
      });
    }
    return transaccion.carousel.findFirst({
      where: { id, tenantId },
      include: { slides: { where: { tenantId }, orderBy: { order: "asc" } } },
    });
  });
}
