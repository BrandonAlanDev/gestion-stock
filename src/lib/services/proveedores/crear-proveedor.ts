import "server-only";

import { prisma } from "@/lib/prisma";
import type { DatosCrearProveedor } from "@/lib/services/proveedores/tipos-proveedor";

export async function crearProveedor(
  tenantId: string,
  datos: DatosCrearProveedor,
) {
  return prisma.provider.create({
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
  });
}
