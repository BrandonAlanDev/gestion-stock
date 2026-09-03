import "server-only";

import { prisma } from "@/lib/prisma";
import type { DatosActualizarProveedor } from "@/lib/services/proveedores/tipos-proveedor";

export async function actualizarProveedor(
  tenantId: string,
  id: string,
  datos: DatosActualizarProveedor,
) {
  const contactos = [...new Set(datos.contactos.map((contacto) => contacto.trim()))];

  return prisma.$transaction(async (tx) => {
    const actualizado = await tx.provider.updateMany({
      where: { id, tenantId, active: true },
      data: { name: datos.nombre, details: datos.detalles },
    });
    if (actualizado.count === 0) throw new Error("Proveedor no encontrado");

    for (const contacto of contactos) {
      const existente = await tx.contactProvider.findFirst({
        where: { tenantId, contact: contacto, idProvider: id },
        select: { id: true },
      });

      if (existente) {
        await tx.contactProvider.updateMany({
          where: { id: existente.id, tenantId, idProvider: id },
          data: { active: true },
        });
      } else {
        await tx.contactProvider.create({
          data: {
            tenantId,
            contact: contacto,
            idProvider: id,
            type: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto)
              ? "EMAIL"
              : "PHONE",
          },
        });
      }
    }

    await tx.contactProvider.updateMany({
      where: { tenantId, idProvider: id, contact: { notIn: contactos } },
      data: { active: false },
    });

    const proveedor = await tx.provider.findFirst({
      where: { id, tenantId, active: true },
      include: { contacts: { where: { tenantId, active: true } } },
    });
    if (!proveedor) throw new Error("Proveedor no encontrado");
    return proveedor;
  });
}
