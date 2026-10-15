import "server-only";

import { prisma } from "@/lib/prisma";

/** Lee la conexión de Mercado Pago de un comercio, o null si nunca se conectó. */
export async function obtenerCuentaMP(tenantId: string) {
  return prisma.cuentaMercadoPago.findUnique({
    where: { tenantId },
  });
}
