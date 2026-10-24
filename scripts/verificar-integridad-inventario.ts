import assert from "node:assert/strict";
import type { Prisma, PrismaClient } from "../generated/prisma/client";
import { actualizarVarianteConControlStock } from "../src/lib/inventario/actualizar-stock-variante";
import {
  bloquearVariantes,
  ErrorVarianteNoEliminable,
  verificarVariantesEliminables,
} from "../src/lib/inventario/variantes-transaccion";
import { eliminarRegistroPrenda } from "../src/lib/services/prendas/eliminar-registro-prenda";
import {
  liberarReservaStockPedido,
  reservarStockPedido,
} from "../src/lib/pedidos/gestionar-reserva-stock";

const ID_VARIANTE = "variante-a";
const ID_PRENDA = "prenda-a";

function comoTransaccion(valor: Record<string, unknown>): Prisma.TransactionClient {
  return valor as unknown as Prisma.TransactionClient;
}

function crearTransaccionStock(stockInicial: number) {
  let stock = stockInicial;
  const movimientos: Array<{ type: string; quantity: number; note: string }> = [];
  const items = new Map<string, { id: string; pedidoId: string; variantId: string; nombre: string; cantidad: number; precioUnitario: number; stockReservado: boolean }>();
  const pedidos = new Map<string, { estado: string; stockReservado: boolean }>();

  const tx = comoTransaccion({
    pedidoItem: {
      async findMany(argumentos: unknown) {
        const where = (argumentos as { where: { pedidoId: string; stockReservado?: boolean } }).where;
        return [...items.values()].filter((item) => item.pedidoId === where.pedidoId &&
          (where.stockReservado === undefined || item.stockReservado === where.stockReservado));
      },
      async updateMany(argumentos: unknown) {
        const raiz = argumentos as { where: { id: string; pedidoId: string; stockReservado?: boolean }; data: { stockReservado: boolean } };
        const item = items.get(raiz.where.id);
        if (!item || item.pedidoId !== raiz.where.pedidoId ||
          (raiz.where.stockReservado !== undefined && item.stockReservado !== raiz.where.stockReservado)) {
          return { count: 0 };
        }
        item.stockReservado = raiz.data.stockReservado;
        return { count: 1 };
      },
    },
    pedido: {
      async updateMany(argumentos: unknown) {
        const raiz = argumentos as { where: { id: string; estado: string; stockReservado: boolean }; data: { stockReservado: boolean } };
        const pedido = pedidos.get(raiz.where.id);
        if (!pedido || pedido.estado !== raiz.where.estado || pedido.stockReservado !== raiz.where.stockReservado) return { count: 0 };
        pedido.stockReservado = raiz.data.stockReservado;
        return { count: 1 };
      },
    },
    garmentVariant: {
      async findMany() {
        return [{ id: ID_VARIANTE, garment: { controlaStock: true } }];
      },
      async updateMany(argumentos: unknown) {
        const raiz = argumentos as { where: { id: string; stock?: number | { gte?: number } }; data: { stock?: { increment?: number; decrement?: number } } };
        if (raiz.where.id !== ID_VARIANTE) return { count: 0 };
        if (typeof raiz.where.stock === "number" && stock !== raiz.where.stock) return { count: 0 };
        if (typeof raiz.where.stock === "object" && stock < (raiz.where.stock.gte ?? 0)) return { count: 0 };
        if (raiz.data.stock?.decrement !== undefined) stock -= raiz.data.stock.decrement;
        if (raiz.data.stock?.increment !== undefined) stock += raiz.data.stock.increment;
        return { count: 1 };
      },
    },
    movement: {
      async create(argumentos: unknown) {
        const data = (argumentos as { data: { type: string; quantity: number; note: string | null } }).data;
        movimientos.push({ type: data.type, quantity: data.quantity, note: data.note ?? "" });
        return { id: `movimiento-${movimientos.length}` };
      },
    },
  });

  return {
    tx,
    movimientos,
    agregarPedido(pedidoId: string, cantidad: number) {
      items.set(`item-${pedidoId}`, {
        id: `item-${pedidoId}`,
        pedidoId,
        variantId: ID_VARIANTE,
        nombre: "Camisa",
        cantidad,
        precioUnitario: 1200,
        stockReservado: false,
      });
      pedidos.set(pedidoId, { estado: "PENDIENTE", stockReservado: true });
    },
    stock: () => stock,
    pedido: (pedidoId: string) => pedidos.get(pedidoId),
    item: (pedidoId: string) => items.get(`item-${pedidoId}`),
  };
}

function crearTransaccionActualizacion(stockInicial: number) {
  let stock = stockInicial;
  const movimientos: Array<{ type: string; quantity: number }> = [];
  return {
    tx: comoTransaccion({
      garmentVariant: {
        async updateMany(argumentos: unknown) {
          const raiz = argumentos as { where: { id: string; garmentId: string; stock?: number }; data: { stock?: { increment: number } } };
          if (raiz.where.id !== ID_VARIANTE || raiz.where.garmentId !== ID_PRENDA ||
            (raiz.where.stock !== undefined && raiz.where.stock !== stock)) return { count: 0 };
          if (raiz.data.stock) stock += raiz.data.stock.increment;
          return { count: 1 };
        },
      },
      movement: {
        async create(argumentos: unknown) {
          const data = (argumentos as { data: { type: string; quantity: number } }).data;
          movimientos.push({ type: data.type, quantity: data.quantity });
          return { id: `movimiento-${movimientos.length}` };
        },
      },
    }),
    movimientos,
    stock: () => stock,
  };
}

async function verificarEdicionesConcurrentes(): Promise<void> {
  const estado = crearTransaccionActualizacion(5);
  const entrada = (stockNuevo: number) => ({
    variantId: ID_VARIANTE,
    garmentId: ID_PRENDA,
    stockOriginal: 5,
    stockNuevo,
    precio: 1200,
    datos: { sku: "CAM-1" },
  });

  const ediciones = await Promise.allSettled([
    actualizarVarianteConControlStock(estado.tx, entrada(8)),
    actualizarVarianteConControlStock(estado.tx, entrada(9)),
  ]);
  assert.equal(ediciones.filter(({ status }) => status === "fulfilled").length, 1, "Solo una edición con snapshot 5 puede modificar el stock");
  assert.equal(ediciones.filter(({ status }) => status === "rejected").length, 1);
  assert.ok(ediciones.some((resultado) => resultado.status === "rejected" && resultado.reason instanceof Error));
  assert.ok([8, 9].includes(estado.stock()), "La segunda edición no debe sobrescribir la primera");
  assert.equal(estado.movimientos.length, 1);
}

async function verificarCompraDuranteEdicionYCancelacion(): Promise<void> {
  const estado = crearTransaccionStock(5);
  estado.agregarPedido("pedido-1", 2);
  await reservarStockPedido("pedido-1", estado.tx);
  assert.equal(estado.stock(), 3);

  await assert.rejects(
    actualizarVarianteConControlStock(estado.tx, {
      variantId: ID_VARIANTE,
      garmentId: ID_PRENDA,
      stockOriginal: 5,
      stockNuevo: 7,
      precio: 1200,
      datos: { sku: "CAM-1" },
    }),
    /stock.*cambió/i,
    "Una edición con datos previos a la reserva debe entrar en conflicto",
  );
  assert.equal(estado.stock(), 3, "La edición obsoleta debe preservar las unidades reservadas");

  const pedido = estado.pedido("pedido-1");
  assert.ok(pedido);
  pedido.estado = "CANCELADO";
  assert.equal(await liberarReservaStockPedido("pedido-1", estado.tx), true);
  assert.equal(estado.stock(), 5, "La cancelación debe devolver las unidades reservadas");
  assert.equal(estado.item("pedido-1")?.stockReservado, false);
  assert.equal(await liberarReservaStockPedido("pedido-1", estado.tx), false, "La liberación debe ser idempotente");
  assert.deepEqual(estado.movimientos.map(({ type, quantity }) => ({ type, quantity })), [
    { type: "OUT", quantity: 2 },
    { type: "IN", quantity: 2 },
  ]);
}

async function verificarAjustesYStockNoNegativo(): Promise<void> {
  const estado = crearTransaccionStock(2);
  const solicitudes = ["pedido-a", "pedido-b"];
  for (const pedidoId of solicitudes) estado.agregarPedido(pedidoId, 2);
  const resultados = await Promise.allSettled(solicitudes.map((pedidoId) => reservarStockPedido(pedidoId, estado.tx)));
  assert.equal(resultados.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(resultados.filter(({ status }) => status === "rejected").length, 1);
  assert.equal(estado.stock(), 0, "Dos reservas simultáneas no deben llevar el stock a negativo");
  assert.equal(estado.movimientos.length, 1, "Solo debe registrarse el egreso confirmado");

  const ajuste = crearTransaccionActualizacion(4);
  await actualizarVarianteConControlStock(ajuste.tx, {
    variantId: ID_VARIANTE,
    garmentId: ID_PRENDA,
    stockOriginal: 4,
    stockNuevo: 7,
    precio: 1200,
    datos: { sku: "CAM-1" },
  });
  await actualizarVarianteConControlStock(ajuste.tx, {
    variantId: ID_VARIANTE,
    garmentId: ID_PRENDA,
    stockOriginal: 7,
    stockNuevo: 5,
    precio: 1200,
    datos: { sku: "CAM-1" },
  });
  assert.equal(ajuste.stock(), 5);
  assert.deepEqual(ajuste.movimientos, [
    { type: "IN", quantity: 3 },
    { type: "OUT", quantity: 2 },
  ]);
}

function crearTransaccionReferencias(
  movimientoExiste: boolean,
  pedidoExiste: boolean,
  stock = 0,
) {
  const respuestas = [
    [{ id: ID_PRENDA }],
    [{ id: ID_VARIANTE }],
    [{ id: ID_VARIANTE, stock }],
  ];
  let eliminaciones = 0;
  const tx = {
    async $queryRaw() {
      return respuestas.shift() ?? [];
    },
    movement: {
      async findFirst() {
        return movimientoExiste ? { variantId: ID_VARIANTE } : null;
      },
    },
    pedidoItem: {
      async findFirst() {
        return pedidoExiste ? { variantId: ID_VARIANTE } : null;
      },
    },
    garment: {
      async deleteMany() {
        eliminaciones += 1;
        return { count: 1 };
      },
    },
  };
  const prisma = {
    async $transaction<T>(operacion: (cliente: unknown) => Promise<T>) {
      return operacion(tx);
    },
  } as unknown as PrismaClient;
  return { prisma, tx: comoTransaccion(tx), eliminaciones: () => eliminaciones };
}

async function verificarProteccionContraEliminacion(): Promise<void> {
  const conMovimiento = crearTransaccionReferencias(true, false);
  await assert.rejects(
    eliminarRegistroPrenda(conMovimiento.prisma, "tenant-a", ID_PRENDA),
    (error: unknown) => error instanceof ErrorVarianteNoEliminable && error.referencia === "movimientos",
  );
  assert.equal(conMovimiento.eliminaciones(), 0, "Una variante con movimientos no debe eliminarse");

  const conPedido = crearTransaccionReferencias(false, true);
  await assert.rejects(
    eliminarRegistroPrenda(conPedido.prisma, "tenant-a", ID_PRENDA),
    (error: unknown) => error instanceof ErrorVarianteNoEliminable && error.referencia === "pedidos",
  );
  assert.equal(conPedido.eliminaciones(), 0, "Una variante asociada a un pedido no debe eliminarse");

  const conStock = crearTransaccionReferencias(false, false, 3);
  await assert.rejects(
    eliminarRegistroPrenda(conStock.prisma, "tenant-a", ID_PRENDA),
    (error: unknown) => error instanceof ErrorVarianteNoEliminable && error.referencia === "stock",
  );
  assert.equal(conStock.eliminaciones(), 0, "No debe perderse stock al eliminar una variante");

  const sinReferencias = crearTransaccionReferencias(false, false);
  await eliminarRegistroPrenda(sinReferencias.prisma, "tenant-a", ID_PRENDA);
  assert.equal(sinReferencias.eliminaciones(), 1, "Un producto sin stock ni referencias puede eliminarse");

  const idsBloqueados = await bloquearVariantes(comoTransaccion({
    async $queryRaw() {
      return [{ id: ID_VARIANTE }];
    },
  }), ["variante-b", ID_VARIANTE, ID_VARIANTE]);
  assert.deepEqual(idsBloqueados, [ID_VARIANTE], "El bloqueo devuelve IDs únicos y ordenados en la consulta");
  await verificarVariantesEliminables(comoTransaccion({
    async $queryRaw() {
      return [];
    },
  }), []);
}

async function main(): Promise<void> {
  await verificarEdicionesConcurrentes();
  await verificarCompraDuranteEdicionYCancelacion();
  await verificarAjustesYStockNoNegativo();
  await verificarProteccionContraEliminacion();
  console.log("Integridad de inventario: concurrencia, ajustes, reservas, cancelaciones y referencias de variantes verificadas en memoria.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
