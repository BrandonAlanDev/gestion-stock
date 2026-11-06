import type { Prisma } from "@/../generated/prisma/client";

type Transaccion = Prisma.TransactionClient;

export class ConflictoStockVarianteError extends Error {
  constructor() {
    super("El stock de una variante cambió mientras se editaba el producto.");
    this.name = "ConflictoStockVarianteError";
  }
}

interface DatosActualizacionStock {
  variantId: string;
  garmentId: string;
  stockOriginal: number;
  stockNuevo: number;
  precio: number;
  datos: Omit<Prisma.GarmentVariantUpdateManyMutationInput, "stock">;
}

/** Actualiza metadatos y aplica únicamente el delta de stock confirmado por el administrador. */
export async function actualizarVarianteConControlStock(
  tx: Transaccion,
  entrada: DatosActualizacionStock,
  registrarMovimiento = true,
): Promise<void> {
  if (!Number.isSafeInteger(entrada.stockOriginal)) {
    throw new Error("El stock original de la variante no es válido.");
  }
  const delta = entrada.stockNuevo - entrada.stockOriginal;
  if (!Number.isSafeInteger(entrada.stockNuevo) || entrada.stockNuevo < 0) {
    throw new Error("El stock de la variante no es válido.");
  }

  const actualizado = await tx.garmentVariant.updateMany({
    where: {
      id: entrada.variantId,
      garmentId: entrada.garmentId,
      ...(delta !== 0 ? {
        stock: {
          equals: entrada.stockOriginal,
          ...(delta < 0 ? { gte: Math.abs(delta) } : {}),
        },
      } : {}),
    },
    data: {
      ...entrada.datos,
      ...(delta !== 0 ? { stock: { increment: delta } } : {}),
    },
  });

  if (actualizado.count !== 1) {
    if (delta !== 0) throw new ConflictoStockVarianteError();
    throw new Error("La variante ya no pertenece al producto.");
  }
  if (delta === 0 || !registrarMovimiento) return;

  await tx.movement.create({
    data: {
      variantId: entrada.variantId,
      type: delta > 0 ? "IN" : "OUT",
      quantity: Math.abs(delta),
      priceAtTime: entrada.precio,
      note: "Ajuste manual desde edición del producto",
    },
  });
}
