import "server-only";

import { conPrisma } from "@/lib/prisma";

/** Borra la conexión de Mercado Pago de un comercio para poder vincular otra cuenta. */
export async function eliminarCuentaMP(tenantId: string) {
  void tenantId;
  await conPrisma((prisma) =>
    prisma.cuentaMercadoPago.deleteMany({ where: {} }),
  );
}
