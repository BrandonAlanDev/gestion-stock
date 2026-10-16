import assert from "node:assert/strict";
import type { Prisma, PrismaClient } from "../generated/prisma/client";
import { crearExpiradorPedidosPendientes } from "../src/lib/pedidos/expirar-pedidos-pendientes";
import {
  liberarReservaStockPedido,
  reservarStockPedido,
} from "../src/lib/pedidos/gestionar-reserva-stock";
import {
  DURACION_RESERVA_MERCADOPAGO_MS,
  obtenerVencimientoReserva,
} from "../src/lib/pedidos/politica-reserva-stock";
import { construirPreferenciaPago } from "../src/lib/mercadopago/construir-preferencia";

interface PedidoFalso {
  id: string;
  tenantId: string;
  estado: string;
  estadoPago: string;
  stockReservado: boolean;
  reservaExpiraEn: Date | null;
}

function comoRegistro(valor: unknown): Record<string, unknown> {
  assert.equal(typeof valor, "object");
  assert.notEqual(valor, null);
  return valor as Record<string, unknown>;
}

async function verificarReservaYLiberacionAtomicas(): Promise<void> {
  const item = {
    id: "item-a",
    pedidoId: "pedido-stock",
    tenantId: "tenant-a",
    variantId: "variante-a",
    nombre: "Camisa",
    cantidad: 2,
    precioUnitario: 1250,
    stockReservado: false,
  };
  let stock = 5;
  const pedido = { estado: "PENDIENTE", stockReservado: true };
  const movimientos: Array<{ type: string; quantity: number; note: string }> = [];
  const tx = {
    pedidoItem: {
      async findMany() {
        return item.stockReservado ? [{ ...item }] : [{ ...item }];
      },
      async updateMany(argumentos: unknown) {
        const raiz = comoRegistro(argumentos);
        const where = comoRegistro(raiz.where);
        if (where.stockReservado !== undefined && item.stockReservado !== where.stockReservado) {
          return { count: 0 };
        }
        item.stockReservado = Boolean(comoRegistro(raiz.data).stockReservado);
        return { count: 1 };
      },
    },
    garmentVariant: {
      async findMany() {
        return [{ id: "variante-a", garment: { controlaStock: true } }];
      },
      async updateMany(argumentos: unknown) {
        const data = comoRegistro(comoRegistro(argumentos).data);
        const stockDelta = comoRegistro(data.stock);
        if (typeof stockDelta.decrement === "number") {
          if (stock < stockDelta.decrement) return { count: 0 };
          stock -= stockDelta.decrement;
        }
        if (typeof stockDelta.increment === "number") stock += stockDelta.increment;
        return { count: 1 };
      },
    },
    movement: {
      async create(argumentos: unknown) {
        const data = comoRegistro(comoRegistro(argumentos).data);
        movimientos.push({
          type: String(data.type),
          quantity: Number(data.quantity),
          note: String(data.note),
        });
        return { id: `movimiento-${movimientos.length}` };
      },
    },
    pedido: {
      async updateMany(argumentos: unknown) {
        const raiz = comoRegistro(argumentos);
        const where = comoRegistro(raiz.where);
        if (where.estado !== pedido.estado || where.stockReservado !== pedido.stockReservado) {
          return { count: 0 };
        }
        Object.assign(pedido, comoRegistro(raiz.data));
        return { count: 1 };
      },
    },
  } as unknown as Prisma.TransactionClient;

  await reservarStockPedido("pedido-stock", "tenant-a", tx);
  assert.equal(stock, 3);
  assert.equal(item.stockReservado, true);
  assert.equal(movimientos[0]?.type, "OUT");

  pedido.estado = "CANCELADO";
  assert.equal(await liberarReservaStockPedido("pedido-stock", "tenant-a", tx), true);
  assert.equal(stock, 5);
  assert.equal(item.stockReservado, false);
  assert.equal(pedido.stockReservado, false);
  assert.equal(movimientos[1]?.type, "IN");
  assert.equal(await liberarReservaStockPedido("pedido-stock", "tenant-a", tx), false);
  assert.equal(stock, 5, "La reserva no debe devolverse dos veces");
}

async function main(): Promise<void> {
  await verificarReservaYLiberacionAtomicas();
  const ahora = new Date("2026-10-16T12:00:00.000Z");
  assert.equal(
    obtenerVencimientoReserva("mercadopago", ahora)?.getTime(),
    ahora.getTime() + DURACION_RESERVA_MERCADOPAGO_MS,
  );
  assert.equal(obtenerVencimientoReserva("transferencia", ahora), null);
  const pedidos: PedidoFalso[] = [
    {
      id: "pedido-vencido",
      tenantId: "tenant-a",
      estado: "PENDIENTE",
      estadoPago: "PENDIENTE",
      stockReservado: true,
      reservaExpiraEn: new Date("2026-10-16T11:59:59.000Z"),
    },
    {
      id: "pedido-futuro",
      tenantId: "tenant-a",
      estado: "PENDIENTE",
      estadoPago: "PENDIENTE",
      stockReservado: true,
      reservaExpiraEn: new Date("2026-10-16T12:01:00.000Z"),
    },
    {
      id: "pedido-otro-tenant",
      tenantId: "tenant-b",
      estado: "PENDIENTE",
      estadoPago: "PENDIENTE",
      stockReservado: true,
      reservaExpiraEn: new Date("2026-10-16T11:00:00.000Z"),
    },
  ];
  const pagosActualizados: string[] = [];
  const reservasLiberadas: string[] = [];

  const prismaFalso = {
    pedido: {
      async findMany(argumentos: unknown) {
        const where = comoRegistro(comoRegistro(argumentos).where);
        const tenantId = String(where.tenantId);
        const expira = comoRegistro(where.reservaExpiraEn).lte as Date;
        return pedidos
          .filter((pedido) => pedido.tenantId === tenantId &&
            pedido.estado === "PENDIENTE" &&
            pedido.stockReservado &&
            pedido.reservaExpiraEn !== null &&
            pedido.reservaExpiraEn <= expira)
          .slice(0, 100)
          .map(({ id }) => ({ id }));
      },
      async updateMany(argumentos: unknown) {
        const raiz = comoRegistro(argumentos);
        const where = comoRegistro(raiz.where);
        const pedido = pedidos.find((candidato) => candidato.id === where.id);
        if (!pedido ||
          pedido.tenantId !== where.tenantId ||
          pedido.estado !== where.estado ||
          pedido.stockReservado !== where.stockReservado ||
          pedido.reservaExpiraEn === null ||
          pedido.reservaExpiraEn > (comoRegistro(where.reservaExpiraEn).lte as Date)) {
          return { count: 0 };
        }
        Object.assign(pedido, comoRegistro(raiz.data));
        return { count: 1 };
      },
    },
    payment: {
      async updateMany(argumentos: unknown) {
        const where = comoRegistro(comoRegistro(argumentos).where);
        pagosActualizados.push(`${String(where.tenantId)}:${String(where.pedidoId)}`);
        return { count: 1 };
      },
    },
    async $transaction<T>(operacion: (tx: unknown) => Promise<T>): Promise<T> {
      return operacion(prismaFalso);
    },
  } as unknown as PrismaClient;

  const expirar = crearExpiradorPedidosPendientes({
    async conPrismaTenant(tenantId, operacion) {
      assert.equal(tenantId, "tenant-a");
      return operacion(prismaFalso);
    },
    async liberarReservaStockPedido(pedidoId, tenantId) {
      const pedido = pedidos.find((candidato) => candidato.id === pedidoId);
      if (!pedido || pedido.tenantId !== tenantId || pedido.estado !== "CANCELADO" || !pedido.stockReservado) {
        return false;
      }
      pedido.stockReservado = false;
      reservasLiberadas.push(`${tenantId}:${pedidoId}`);
      return true;
    },
  });

  assert.equal(await expirar("tenant-a", ahora), 1);
  assert.deepEqual(pedidos.map(({ id, estado, stockReservado }) => ({ id, estado, stockReservado })), [
    { id: "pedido-vencido", estado: "CANCELADO", stockReservado: false },
    { id: "pedido-futuro", estado: "PENDIENTE", stockReservado: true },
    { id: "pedido-otro-tenant", estado: "PENDIENTE", stockReservado: true },
  ]);
  assert.deepEqual(pagosActualizados, ["tenant-a:pedido-vencido"]);
  assert.deepEqual(reservasLiberadas, ["tenant-a:pedido-vencido"]);
  assert.equal(await expirar("tenant-a", ahora), 0, "La expiración repetida no libera dos veces");

  const venceEn = new Date("2026-10-16T12:30:00.000Z");
  const preferencia = construirPreferenciaPago({
    id: "pedido-a",
    moneda: "ARS",
    total: 2500,
    reservaExpiraEn: venceEn,
    nombreCliente: null,
    emailCliente: null,
    items: [{ nombre: "Producto", cantidad: 1, precioUnitario: 2500 }],
  }, "https://tienda.example.com", "tenant-a");
  assert.equal(preferencia.expiration_date_to, venceEn.toISOString());
  console.log("Reservas de stock: expiración, alcance por tenant e idempotencia verificados con doble en memoria.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
