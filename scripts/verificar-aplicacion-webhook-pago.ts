import assert from "node:assert/strict";
import type { Prisma, PrismaClient } from "../generated/prisma/client";
import {
  crearAplicadorWebhookPago,
  type DependenciasAplicadorWebhookPago,
} from "../src/lib/pagos/aplicar-webhook-pago";
import type { PagoWebhookNormalizado } from "../src/lib/pagos/tipos";

interface PedidoFalso {
  id: string;
  total: number;
  moneda: string;
  metodoPago: string;
  estado: string;
  estadoPago: string;
  stockReservado: boolean;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
}

interface PagoFalso {
  id: string;
  pedidoId: string;
  proveedor: string;
  externalId: string | null;
  estado: string;
  monto: number;
  moneda: string;
}

interface OpcionesPrismaFalso {
  pedido?: Partial<PedidoFalso>;
  pagos?: PagoFalso[];
  actualizarPedido?: boolean;
}

interface PrismaFalso {
  cliente: PrismaClient;
  obtenerPedido(): PedidoFalso | null;
  obtenerPagos(): PagoFalso[];
  obtenerTransacciones(): number;
  obtenerReversiones(): number;
}

function comoRegistro(valor: unknown): Record<string, unknown> {
  assert.equal(typeof valor, "object");
  assert.notEqual(valor, null);
  return valor as Record<string, unknown>;
}

function coincideEstado(actual: string, filtro: unknown): boolean {
  if (typeof filtro === "string") return actual === filtro;
  const campos = comoRegistro(filtro);
  if (typeof campos.not === "string" && actual === campos.not) return false;
  if (Array.isArray(campos.notIn) && campos.notIn.includes(actual)) return false;
  return true;
}

function crearPrismaFalso(opciones: OpcionesPrismaFalso = {}): PrismaFalso {
  let pedido: PedidoFalso | null = {
    id: "pedido-a",
    total: 2500,
    moneda: "ARS",
    metodoPago: "mercadopago",
    estado: "PENDIENTE",
    estadoPago: "PENDIENTE",
    stockReservado: false,
    mpPreferenceId: "pref-a",
    mpPaymentId: null,
    ...opciones.pedido,
  };
  let pagos = (opciones.pagos ?? []).map((pago) => ({ ...pago }));
  let transacciones = 0;
  let reversiones = 0;
  let secuenciaPago = pagos.length;

  const clienteTx = {
    pedido: {
      async findFirst() {
        return pedido ? { ...pedido } : null;
      },
      async updateMany(argumentos: unknown) {
        if (!pedido) return { count: 0 };
        const raiz = comoRegistro(argumentos);
        const where = comoRegistro(raiz.where);
        if (where.id !== pedido.id) return { count: 0 };
        if (where.estado && !coincideEstado(pedido.estado, where.estado)) return { count: 0 };
        if (opciones.actualizarPedido === false) return { count: 0 };
        Object.assign(pedido, comoRegistro(raiz.data));
        return { count: 1 };
      },
    },
    payment: {
      async findFirst(argumentos: unknown) {
        const where = comoRegistro(comoRegistro(argumentos).where);
        return pagos.find((pago) =>
          pago.proveedor === where.proveedor &&
          (where.pedidoId === undefined || pago.pedidoId === where.pedidoId) &&
          pago.externalId === where.externalId &&
          (where.estado === undefined || coincideEstado(pago.estado, where.estado)),
        ) ?? null;
      },
      async create(argumentos: unknown) {
        const data = comoRegistro(comoRegistro(argumentos).data);
        secuenciaPago += 1;
        const pago: PagoFalso = {
          id: `payment-${secuenciaPago}`,
          pedidoId: String(data.pedidoId),
          proveedor: String(data.proveedor),
          externalId: typeof data.externalId === "string" ? data.externalId : null,
          estado: String(data.estado),
          monto: Number(data.monto),
          moneda: String(data.moneda),
        };
        pagos.push(pago);
        return { ...pago };
      },
      async updateMany(argumentos: unknown) {
        const raiz = comoRegistro(argumentos);
        const where = comoRegistro(raiz.where);
        const pago = pagos.find((candidato) =>
          (where.id === undefined || candidato.id === where.id) &&
          candidato.pedidoId === where.pedidoId &&
          candidato.proveedor === where.proveedor &&
          candidato.externalId === where.externalId &&
          coincideEstado(candidato.estado, where.estado),
        );
        if (!pago) return { count: 0 };
        const data = comoRegistro(raiz.data);
        if (typeof data.estado === "string") pago.estado = data.estado;
        if (typeof data.monto === "number") pago.monto = data.monto;
        if (typeof data.externalId === "string") pago.externalId = data.externalId;
        return { count: 1 };
      },
    },
  } as unknown as Prisma.TransactionClient;

  const cliente = {
    async $transaction<T>(operacion: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
      const pedidoAnterior = pedido ? { ...pedido } : null;
      const pagosAnteriores = pagos.map((pago) => ({ ...pago }));
      transacciones += 1;
      try {
        return await operacion(clienteTx);
      } catch (error) {
        pedido = pedidoAnterior;
        pagos = pagosAnteriores;
        reversiones += 1;
        throw error;
      }
    },
  } as unknown as PrismaClient;

  return {
    cliente,
    obtenerPedido: () => pedido ? { ...pedido } : null,
    obtenerPagos: () => pagos.map((pago) => ({ ...pago })),
    obtenerTransacciones: () => transacciones,
    obtenerReversiones: () => reversiones,
  };
}

function crearPago(estadoExterno = "approved"): PagoWebhookNormalizado {
  return {
    externalId: "mp-123",
    pedidoId: "pedido-a",
    estadoExterno,
    montoPago: 2500,
    monedaPago: "ARS",
  };
}

function crearAplicador(
  prismaFalso: PrismaFalso,
  opciones: { fallarAlDescontarStock?: boolean } = {},
) {
  const pedidosConDescuento: string[] = [];
  const pedidosConReservaConfirmada: string[] = [];
  const reservasLiberadas: string[] = [];
  const dependencias: DependenciasAplicadorWebhookPago = {
    async conPrisma(operacion) {
      return operacion(prismaFalso.cliente);
    },
    async descontarStockPedido(pedidoId, tx) {
      assert.ok(tx);
      pedidosConDescuento.push(pedidoId);
      if (opciones.fallarAlDescontarStock) throw new Error("Stock insuficiente");
    },
    async confirmarReservaStockPedido(pedidoId, tx) {
      assert.ok(tx);
      pedidosConReservaConfirmada.push(pedidoId);
    },
    async liberarReservaStockPedido(pedidoId, tx) {
      assert.ok(tx);
      reservasLiberadas.push(pedidoId);
      return true;
    },
  };
  return {
    aplicar: crearAplicadorWebhookPago(dependencias),
    pedidosConDescuento,
    pedidosConReservaConfirmada,
    reservasLiberadas,
  };
}

async function verificarAprobacionIdempotenteYEventosFueraDeOrden(): Promise<void> {
  const prisma = crearPrismaFalso();
  const aplicador = crearAplicador(prisma);

  await aplicador.aplicar(crearPago());
  assert.deepEqual(aplicador.pedidosConDescuento, ["pedido-a"]);
  assert.equal(prisma.obtenerTransacciones(), 1);
  assert.equal(prisma.obtenerPedido()?.estado, "CONFIRMADO");
  assert.equal(prisma.obtenerPagos()[0]?.estado, "APROBADO");

  await aplicador.aplicar(crearPago());
  assert.equal(prisma.obtenerTransacciones(), 2);
  assert.equal(prisma.obtenerPagos().length, 1, "El reintento no debe crear un segundo pago");
  assert.equal(aplicador.pedidosConDescuento.length, 1, "El reintento no debe descontar stock dos veces");

  await aplicador.aplicar(crearPago("pending"));
  assert.equal(prisma.obtenerPedido()?.estado, "CONFIRMADO");
  assert.equal(prisma.obtenerPedido()?.estadoPago, "APROBADO");
  assert.equal(prisma.obtenerPagos()[0]?.estado, "APROBADO", "Un aviso viejo no debe degradar el pago");
  assert.equal(aplicador.pedidosConDescuento.length, 1);
}

async function verificarMontoMonedaYAsociacion(): Promise<void> {
  const prisma = crearPrismaFalso();
  const aplicador = crearAplicador(prisma);
  const montoIncorrecto = { ...crearPago(), montoPago: 2499 };
  await aplicador.aplicar(montoIncorrecto);
  await aplicador.aplicar({ ...crearPago(), monedaPago: "USD" });
  assert.equal(prisma.obtenerPagos().length, 0);
  assert.equal(aplicador.pedidosConDescuento.length, 0);

  const vinculadoAOtroPedido = crearPrismaFalso({
    pagos: [{
      id: "payment-otro",
      pedidoId: "pedido-b",
        proveedor: "mercadopago",
      externalId: "mp-123",
      estado: "PENDIENTE",
      monto: 2500,
      moneda: "ARS",
    }],
  });
  const aplicadorVinculado = crearAplicador(vinculadoAOtroPedido);
  await aplicadorVinculado.aplicar(crearPago());
  assert.equal(vinculadoAOtroPedido.obtenerPedido()?.estado, "PENDIENTE");
  assert.equal(vinculadoAOtroPedido.obtenerPagos()[0]?.pedidoId, "pedido-b");
  assert.equal(aplicadorVinculado.pedidosConDescuento.length, 0);
}

async function verificarPedidoReservadoNoDescuentaDosVeces(): Promise<void> {
  const prisma = crearPrismaFalso({ pedido: { stockReservado: true } });
  const aplicador = crearAplicador(prisma);

  await aplicador.aplicar(crearPago());

  assert.equal(prisma.obtenerPedido()?.estado, "CONFIRMADO");
  assert.equal(prisma.obtenerPedido()?.stockReservado, false);
  assert.deepEqual(aplicador.pedidosConReservaConfirmada, ["pedido-a"]);
  assert.deepEqual(aplicador.pedidosConDescuento, []);
}

async function verificarCancelacionLiberaReservaUnaVez(): Promise<void> {
  const prisma = crearPrismaFalso({ pedido: { stockReservado: true } });
  const aplicador = crearAplicador(prisma);

  await aplicador.aplicar(crearPago("cancelled"));

  assert.equal(prisma.obtenerPedido()?.estado, "CANCELADO");
  assert.deepEqual(aplicador.reservasLiberadas, ["pedido-a"]);
}

async function verificarPagoAprobadoTrasVencimientoQuedaVisible(): Promise<void> {
  const prisma = crearPrismaFalso({
    pedido: { estado: "CANCELADO", estadoPago: "CANCELADO", stockReservado: false },
  });
  const aplicador = crearAplicador(prisma);

  await aplicador.aplicar(crearPago("approved"));

  assert.equal(prisma.obtenerPedido()?.estado, "CANCELADO");
  assert.equal(prisma.obtenerPagos()[0]?.estado, "APROBADO");
  assert.deepEqual(aplicador.pedidosConDescuento, []);
  assert.deepEqual(aplicador.pedidosConReservaConfirmada, []);
}

async function verificarReversionesTransaccionales(): Promise<void> {
  const conflicto = crearPrismaFalso({ actualizarPedido: false });
  const aplicadorConflicto = crearAplicador(conflicto);
  await aplicadorConflicto.aplicar(crearPago());
  assert.equal(conflicto.obtenerReversiones(), 1);
  assert.equal(conflicto.obtenerPedido()?.estado, "PENDIENTE");
  assert.equal(conflicto.obtenerPagos().length, 0);
  assert.equal(aplicadorConflicto.pedidosConDescuento.length, 0);

  const faltaStock = crearPrismaFalso();
  const aplicadorSinStock = crearAplicador(faltaStock, { fallarAlDescontarStock: true });
  await assert.rejects(
    aplicadorSinStock.aplicar(crearPago()),
    /Stock insuficiente/,
  );
  assert.equal(faltaStock.obtenerReversiones(), 1);
  assert.equal(faltaStock.obtenerPedido()?.estado, "PENDIENTE");
  assert.equal(faltaStock.obtenerPagos().length, 0);
}

async function main(): Promise<void> {
  await verificarAprobacionIdempotenteYEventosFueraDeOrden();
  await verificarMontoMonedaYAsociacion();
  await verificarPedidoReservadoNoDescuentaDosVeces();
  await verificarCancelacionLiberaReservaUnaVez();
  await verificarPagoAprobadoTrasVencimientoQuedaVisible();
  await verificarReversionesTransaccionales();
  console.log("Aplicación de pagos: monto, moneda, idempotencia y fallos transaccionales verificados con doble en memoria.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
