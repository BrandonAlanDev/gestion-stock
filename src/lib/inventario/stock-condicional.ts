import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import { medirTiempoInventario } from "@/lib/inventario/medir-tiempo-inventario";
import type { ProductoSinStockCheckout } from "@/lib/pedidos/tipos-resumen-checkout";

type ClienteTransaccional = Prisma.TransactionClient;

export function mensajeStockNoDisponible(nombreProducto?: string): string {
  return nombreProducto
    ? `Ya no hay stock disponible de “${nombreProducto}”. Actualizá el carrito para continuar.`
    : "Ya no hay stock disponible del producto. Actualizá el carrito para continuar.";
}

export class ErrorStockInsuficiente extends Error {
  readonly codigo = "STOCK_INSUFICIENTE" as const;

  constructor(
    nombreProducto?: string,
    readonly productoSinStock: ProductoSinStockCheckout | null = null,
  ) {
    super(mensajeStockNoDisponible(nombreProducto));
    this.name = "ErrorStockInsuficiente";
  }
}

export class ErrorConflictoReservaStock extends Error {
  constructor(readonly productoSinStock: ProductoSinStockCheckout | null = null) {
    super(mensajeStockNoDisponible());
    this.name = "ErrorConflictoReservaStock";
  }
}

/** Reconoce conflictos de escritura conocidos sin reintentar la creación del pedido. */
export function esConflictoTransaccionalInventario(error: unknown): boolean {
  const codigos = new Set([
    "P2028", "P2034", "1205", "1213", "8002", "8022", "9007",
    "ER_LOCK_WAIT_TIMEOUT", "ER_LOCK_DEADLOCK",
  ]);
  const pendientes: unknown[] = [error];
  const visitados = new Set<object>();

  while (pendientes.length > 0) {
    const actual = pendientes.pop();
    if (!actual || typeof actual !== "object" || visitados.has(actual)) continue;
    visitados.add(actual);
    const registro = actual as Record<string, unknown>;
    const codigo = String(registro.code ?? registro.errno ?? "");
    const meta = registro.meta && typeof registro.meta === "object"
      ? registro.meta as Record<string, unknown>
      : undefined;
    const codigoMeta = String(meta?.code ?? meta?.errno ?? "");
    const mensaje = typeof registro.message === "string" ? registro.message : "";
    if (codigos.has(codigo) || codigos.has(codigoMeta) ||
      /(?:write conflict|deadlock|lock wait timeout|transaction.*expired)/i.test(mensaje)) {
      return true;
    }
    pendientes.push(registro.cause, registro.originalCode, registro.meta);
  }
  return false;
}

/** Descuenta en una sola sentencia solo si la variante conserva unidades suficientes. */
export async function descontarStockCondicional(
  tx: ClienteTransaccional,
  variantId: string,
  cantidad: number,
): Promise<boolean> {
  if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
    throw new Error("La cantidad de stock a descontar no es válida");
  }

  const resultado = await medirTiempoInventario("inventario.descontar_condicional", 1, () =>
    tx.garmentVariant.updateMany({
      where: {
        id: variantId,
        stock: { gte: cantidad },
      },
      data: { stock: { decrement: cantidad } },
    }),
  );

  return resultado.count === 1;
}
