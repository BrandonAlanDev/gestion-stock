import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import { calcularOpcionesEntregaCheckout } from "@/lib/pedidos/opciones-entrega";

/** Lee la disponibilidad de entrega desde el PageConfig del tenant solicitado. */
export async function obtenerOpcionesEntregaTienda(tenantId: string) {
  const configuracion = await conPrismaTenant(tenantId, (prisma) =>
    prisma.pageConfig.findUnique({
      where: { clave: "principal" },
      select: {
        checkoutEnabled: true,
        locationEnabled: true,
        address: true,
        postalCode: true,
        city: true,
        province: true,
        country: true,
      },
    }),
  );

  return calcularOpcionesEntregaCheckout(configuracion);
}
