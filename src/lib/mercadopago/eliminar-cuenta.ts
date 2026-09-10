import "server-only";

import { prisma } from "@/lib/prisma";

/** Borra la conexión de Mercado Pago de un comercio para poder vincular otra cuenta. */
export async function eliminarCuentaMP(tenantId: string) {
  await prisma.cuentaMercadoPago.deleteMany({
    where: { tenantId },
  });
}
