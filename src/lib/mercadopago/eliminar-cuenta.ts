import "server-only";

import { conPrismaTenant } from "@/lib/prisma";

/** Borra la conexión de Mercado Pago de un comercio para poder vincular otra cuenta. */
export async function eliminarCuentaMP(tenantId: string) {
  await conPrismaTenant(tenantId, (prisma) =>
    prisma.cuentaMercadoPago.deleteMany({ where: {} }),
  );
}
