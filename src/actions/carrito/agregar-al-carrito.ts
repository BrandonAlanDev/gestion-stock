"use server";

import { conPrisma } from "@/lib/prisma";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export type ResultadoAgregarCarrito =
  | { ok: true; stock: number }
  | { ok: false; error: string };

export async function agregarAlCarrito(datos: {
  productId: string;
  variantId: string;
  cantidad: number;
}): Promise<ResultadoAgregarCarrito> {
  await requiereTenantActivo();

  if (!Number.isInteger(datos.cantidad) || datos.cantidad < 1) {
    return { ok: false, error: "La cantidad no es válida." };
  }

  const variant = await conPrisma((prisma) =>
    prisma.garmentVariant.findFirst({
      where: { id: datos.variantId, garmentId: datos.productId },
      include: { garment: { select: { controlaStock: true } } },
    }),
  );

  if (!variant) {
    return { ok: false, error: "El producto no está disponible." };
  }

  if (variant.garment.controlaStock) {
    if (variant.stock <= 0) {
      return { ok: false, error: "Sin stock disponible en esta combinación." };
    }

    if (datos.cantidad > variant.stock) {
      return {
        ok: false,
        error: `La cantidad solicitada supera el stock disponible (${variant.stock}). Podés agregar hasta ${variant.stock} unidades.`,
      };
    }
  }

  return { ok: true, stock: variant.stock };
}
//hol
