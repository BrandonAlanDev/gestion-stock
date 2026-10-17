import "server-only";

import { conPrisma } from "@/lib/prisma";
import type { DatosCrearProveedor } from "@/lib/services/proveedores/tipos-proveedor";

export async function crearProveedor(
  tenantId: string,
  datos: DatosCrearProveedor,
) {
  return conPrisma((prisma) => prisma.provider.create({
    data: {
      name: datos.nombre,
      details: datos.detalles,
      contacts: {
        create: datos.contactos.map(({ contacto, tipo }) => ({
          contact: contacto,
          type: tipo,
        })),
      },
    },
    include: { contacts: { where: { active: true } } },
  }));
}
