import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import {
  bloquearVariantes,
  obtenerControlStockVariantesBloqueadas,
} from "@/lib/inventario/variantes-transaccion";
import { medirTiempoInventario } from "@/lib/inventario/medir-tiempo-inventario";
import {
  descontarStockCondicional,
  ErrorStockInsuficiente,
} from "@/lib/inventario/stock-condicional";

type ClienteTx = Prisma.TransactionClient;

/**
 * Descuenta el stock de las variantes de un pedido y registra un movimiento
 * de egreso por ítem, de forma atómica. Solo descuenta productos que controlan
 * stock. El llamado debe garantizar la idempotencia (solo se invoca una vez) y
 * el recorrido se hace en una única transacción para evitar parcialidades.
 */
export async function descontarStockPedido(
  pedidoId: string,
  cliente: ClienteTx,
) {
  const items = await cliente.pedidoItem.findMany({
    where: { pedidoId },
  });

  if (!items.length) return;

  const idsVariantes = [...new Set(items.map((item) => item.variantId))];
  const bloqueadas = await bloquearVariantes(cliente, idsVariantes);
  if (bloqueadas.length !== idsVariantes.length) {
    throw new Error("Una variante del pedido ya no está disponible");
  }

  const controlStock = await obtenerControlStockVariantesBloqueadas(cliente, idsVariantes);
  const descontables = items.filter((item) => {
    const controla = controlStock.get(item.variantId);
    if (controla === undefined) throw new Error(`La variante del producto "${item.nombre}" ya no existe`);
    return controla;
  });

  await medirTiempoInventario("venta.actualizar_stock", descontables.length, async () => {
    for (const item of descontables) {
      const descontado = await descontarStockCondicional(cliente, item.variantId, item.cantidad);
      if (!descontado) {
        throw new ErrorStockInsuficiente(item.nombre, {
          variantId: item.variantId,
          nombre: item.nombre,
          variante: item.varianteNombre,
          imagen: item.imagen,
        });
      }
    }
  });

  if (descontables.length > 0) {
    await cliente.movement.createMany({
      data: descontables.map((item) => ({
        variantId: item.variantId,
        type: "OUT",
        quantity: item.cantidad,
        priceAtTime: Number(item.precioUnitario),
        note: `Venta · pedido ${pedidoId}`,
      })),
    });
  }
}
