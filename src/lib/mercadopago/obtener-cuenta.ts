import "server-only";

import { conPrisma } from "@/lib/prisma";

/** Lee la conexión de Mercado Pago de un comercio, o null si nunca se conectó. */
export async function obtenerCuentaMP(tenantId: string) {
  void tenantId;
  return conPrisma((prisma) =>
    prisma.cuentaMercadoPago.findUnique({ where: { clave: "principal" } }),
  );
}
