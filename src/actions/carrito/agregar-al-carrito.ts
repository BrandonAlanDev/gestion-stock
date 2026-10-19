"use server";

import { z } from "zod";
import { conPrisma } from "@/lib/prisma";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export type ResultadoAgregarCarrito =
  | { ok: true; stock: number }
  | { ok: false; error: string };

const esquemaAgregarCarrito = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  cantidad: z.number().int().positive(),
});

export async function agregarAlCarrito(datos: {
  productId: string;
  variantId: string;
  cantidad: number;
}): Promise<ResultadoAgregarCarrito> {
  await requiereTenantActivo();

  const resultado = esquemaAgregarCarrito.safeParse(datos);
  if (!resultado.success) return { ok: false, error: "Los datos del producto no son válidos." };

  const variant = await conPrisma((prisma) =>
    prisma.garmentVariant.findFirst({
      where: {
        id: resultado.data.variantId,
        garmentId: resultado.data.productId,
        garment: { active: true },
      },
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

    if (resultado.data.cantidad > variant.stock) {
      return {
        ok: false,
        error: `La cantidad solicitada supera el stock disponible (${variant.stock}). Podés agregar hasta ${variant.stock} unidades.`,
      };
    }
  }

  return { ok: true, stock: variant.stock };
}
