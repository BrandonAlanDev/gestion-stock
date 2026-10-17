import "server-only";

import { conPrismaTenant } from "@/lib/prisma";

/** Lee la conexión de Mercado Pago de un comercio, o null si nunca se conectó. */
export async function obtenerCuentaMP(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.cuentaMercadoPago.findUnique({ where: { clave: "principal" } }),
  );
}
