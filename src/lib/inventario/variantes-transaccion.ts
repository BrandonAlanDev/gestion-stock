import { Prisma } from "@/../generated/prisma/client";
import type { Prisma as PrismaTypes } from "@/../generated/prisma/client";

type Transaccion = PrismaTypes.TransactionClient;

export type ReferenciaVariante = "stock" | "movimientos" | "pedidos";

export class ErrorVarianteNoEliminable extends Error {
  constructor(readonly referencia: ReferenciaVariante) {
    const mensajes: Record<ReferenciaVariante, string> = {
      stock: "No se puede eliminar una variante que todavía tiene stock.",
      movimientos: "No se puede eliminar una variante con movimientos de inventario.",
      pedidos: "No se puede eliminar una variante asociada a pedidos.",
    };
    super(mensajes[referencia]);
    this.name = "ErrorVarianteNoEliminable";
  }
}

/** Bloquea las filas en un orden estable para serializar reservas y eliminaciones. */
export async function bloquearVariantes(
  tx: Transaccion,
  idsRecibidos: string[],
): Promise<string[]> {
  const ids = [...new Set(idsRecibidos)].sort();
  if (ids.length === 0) return [];

  const filas = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id
    FROM GarmentVariant
    WHERE id IN (${Prisma.join(ids)})
    ORDER BY id
    FOR UPDATE
  `);
  return filas.map(({ id }) => id);
}

/**
 * Impide eliminar variantes que perderían stock o historial. Sus llamadores
 * usan READ COMMITTED; después de bloquear las variantes, las consultas de
 * referencias ven pedidos y movimientos confirmados mientras se esperaba.
 */
export async function verificarVariantesEliminables(
  tx: Transaccion,
  idsRecibidos: string[],
): Promise<void> {
  const ids = [...new Set(idsRecibidos)].sort();
  if (ids.length === 0) return;

  const bloqueadas = await tx.$queryRaw<Array<{ id: string; stock: number }>>(Prisma.sql`
    SELECT id, stock
    FROM GarmentVariant
    WHERE id IN (${Prisma.join(ids)})
    ORDER BY id
    FOR UPDATE
  `);
  if (bloqueadas.length !== ids.length) {
    throw new Error("Una variante dejó de existir mientras se actualizaba el producto.");
  }
  if (bloqueadas.some(({ stock }) => stock > 0)) {
    throw new ErrorVarianteNoEliminable("stock");
  }

  const movimiento = await tx.movement.findFirst({
    where: { variantId: { in: ids } },
    select: { variantId: true },
  });
  if (movimiento) throw new ErrorVarianteNoEliminable("movimientos");

  const itemPedido = await tx.pedidoItem.findFirst({
    where: { variantId: { in: ids } },
    select: { variantId: true },
  });
  if (itemPedido) throw new ErrorVarianteNoEliminable("pedidos");
}
