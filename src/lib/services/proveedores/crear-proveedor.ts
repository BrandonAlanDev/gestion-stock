import "server-only";

import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import type { DatosCrearProveedor } from "@/lib/services/proveedores/tipos-proveedor";

export async function crearProveedor(
  tenantId: string,
  datos: DatosCrearProveedor,
) {
  return conPrismaTenant(tenantId, (prisma) => prisma.provider.create({
    data: {
      tenantId,
      name: datos.nombre,
      details: datos.detalles,
      contacts: {
        create: datos.contactos.map(({ contacto, tipo }) => ({
          tenantId,
          contact: contacto,
          type: tipo,
        })),
      },
    },
    include: { contacts: { where: { tenantId, active: true } } },
  }));
}
