import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import type { EntradaActualizarCarrusel } from "@/lib/services/carruseles/tipos";
import type { Prisma } from "../../../../generated/prisma/client";

export async function actualizarCarrusel(tenantId: string, datos: EntradaActualizarCarrusel) {
  const { id, slides, ...cambios } = datos;
  return conPrismaTenant(tenantId, async (prisma) => {
    const existente = await prisma.carousel.findFirst({ where: { id }, select: { id: true } });
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
      await transaccion.carouselSlide.deleteMany({ where: { carouselId: id } });
      await transaccion.carouselSlide.createMany({
        data: slides.map((diapositiva) => ({
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
      where: { id },
      include: { slides: { where: {}, orderBy: { order: "asc" } } },
    });
    });
  });
}
