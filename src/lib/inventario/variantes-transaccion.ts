import { Prisma } from "@/../generated/prisma/client";
import type { Prisma as PrismaTypes } from "@/../generated/prisma/client";
import { medirTiempoInventario } from "@/lib/inventario/medir-tiempo-inventario";

type Transaccion = PrismaTypes.TransactionClient;

export class ErrorModoTransaccionInventario extends Error {
  constructor() {
    super("TiDB debe usar el modo de transacción pesimista para proteger las reservas de inventario.");
    this.name = "ErrorModoTransaccionInventario";
  }
}

function esVariableTiDBDesconocida(error: unknown): boolean {
  const pendientes: unknown[] = [error];
  const visitados = new Set<object>();

  while (pendientes.length > 0) {
    const actual = pendientes.pop();
    if (!actual || typeof actual !== "object" || visitados.has(actual)) continue;
    visitados.add(actual);
    const registro = actual as Record<string, unknown>;
    const codigo = String(registro.code ?? registro.errno ?? "");
    const mensaje = typeof registro.message === "string" ? registro.message : "";
    if (codigo === "1193" || codigo === "ER_UNKNOWN_SYSTEM_VARIABLE" ||
      /unknown system variable/i.test(mensaje)) return true;
    pendientes.push(registro.cause, registro.originalCode, registro.meta);
  }
  return false;
}

/** Falla cerrado en TiDB si esta conexión no puede tomar bloqueos de fila reales. */
async function verificarModoTransaccionTiDB(tx: Transaccion): Promise<void> {
  let filas: Array<{ modo: string }>;
  try {
    filas = await tx.$queryRaw<Array<{ modo: string }>>`
      SELECT @@SESSION.tidb_txn_mode AS modo
    `;
  } catch (error) {
    if (esVariableTiDBDesconocida(error) &&
      process.env.TENANT_TIDB_TXN_MODE !== "pessimistic") return;
    throw error;
  }

  if (filas[0]?.modo.toLowerCase() !== "pessimistic") {
    throw new ErrorModoTransaccionInventario();
  }
}

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

  await medirTiempoInventario("inventario.verificar_modo_transaccion", ids.length, () =>
    verificarModoTransaccionTiDB(tx),
  );

  const filas = await medirTiempoInventario("inventario.bloquear_variantes", ids.length, () =>
    tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM GarmentVariant
      WHERE id IN (${Prisma.join(ids)})
      ORDER BY id
      FOR UPDATE
    `),
  );
  return filas.map(({ id }) => id);
}

/**
 * Lee la configuración vigente del producto con una lectura bloqueante.
 * Debe llamarse después de bloquear las variantes en la misma transacción:
 * en REPEATABLE READ, un findMany normal podría devolver un snapshot anterior
 * a una activación concurrente del seguimiento de stock.
 */
export async function obtenerControlStockVariantesBloqueadas(
  tx: Transaccion,
  idsRecibidos: string[],
): Promise<Map<string, boolean>> {
  const ids = [...new Set(idsRecibidos)].sort();
  if (ids.length === 0) return new Map();

  const filas = await medirTiempoInventario("inventario.leer_control_stock_bloqueante", ids.length, () =>
    tx.$queryRaw<Array<{ variantId: string; controlaStock: boolean }>>(Prisma.sql`
      SELECT variante.id AS variantId, prenda.controlaStock AS controlaStock
      FROM GarmentVariant AS variante
      INNER JOIN Garment AS prenda ON prenda.id = variante.garmentId
      WHERE variante.id IN (${Prisma.join(ids)})
      ORDER BY prenda.id, variante.id
      FOR UPDATE
    `),
  );
  if (filas.length !== ids.length) {
    throw new Error("Una variante del pedido ya no está disponible");
  }
  return new Map(filas.map((fila) => [fila.variantId, Boolean(fila.controlaStock)]));
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

  await medirTiempoInventario("inventario.verificar_modo_transaccion", ids.length, () =>
    verificarModoTransaccionTiDB(tx),
  );

  const bloqueadas = await medirTiempoInventario("inventario.bloquear_variantes_eliminables", ids.length, () =>
    tx.$queryRaw<Array<{ id: string; stock: number }>>(Prisma.sql`
      SELECT id, stock
      FROM GarmentVariant
      WHERE id IN (${Prisma.join(ids)})
      ORDER BY id
      FOR UPDATE
    `),
  );
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
