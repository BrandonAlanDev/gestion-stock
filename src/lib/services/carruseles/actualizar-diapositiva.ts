import { prisma } from "@/lib/prisma";
import type { EntradaDiapositivaCarrusel } from "@/lib/services/carruseles/tipos";
import type { Prisma } from "../../../../generated/prisma/client";

export async function actualizarDiapositiva(
  tenantId: string,
  datos: EntradaDiapositivaCarrusel & { id: string },
) {
  const { id, ...cambios } = datos;
  const existente = await prisma.carouselSlide.findFirst({
    where: { id, tenantId, carousel: { tenantId } },
    select: { id: true },
  });
  if (!existente) throw new Error("La diapositiva no pertenece a la tienda activa");
  return prisma.carouselSlide.update({
    where: { id },
    data: { ...cambios, config: cambios.config as Prisma.InputJsonValue | undefined },
  });
}
