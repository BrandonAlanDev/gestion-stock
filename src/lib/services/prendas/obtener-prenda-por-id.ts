import { conPrismaTenant } from "@/lib/prisma";
import { SELECCION_PRODUCTO_PUBLICO } from "./seleccion-producto-publico";

export async function obtenerPrendaPorId(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.garment.findFirst({
    where: { id, active: true },
    select: SELECCION_PRODUCTO_PUBLICO,
  }));
}
