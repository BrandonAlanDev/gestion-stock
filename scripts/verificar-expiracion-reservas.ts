import assert from "node:assert/strict";
import type { PrismaClient } from "../generated/prisma/client";
import { crearExpiradorPedidosPendientes } from "../src/lib/pedidos/expirar-pedidos-pendientes";
import { combinarConfigMetodoPago, crearConfigInicialMetodoPago } from "../src/lib/pagos/configuracion-metodo";
import {
  DURACION_RESERVA_MERCADOPAGO_MS,
  DURACION_RESERVA_MANUAL_HORAS_MAXIMA,
  DURACION_RESERVA_MANUAL_HORAS_MINIMA,
  leerPoliticaVencimientoReserva,
  obtenerVencimientoReserva,
} from "../src/lib/pedidos/politica-reserva-stock";

interface PedidoFalso {
  id: string;
  estado: string;
  estadoPago: string;
  metodoPago: string | null;
  stockReservado: boolean;
  reservaExpiraEn: Date | null;
}

function registro(valor: unknown): Record<string, unknown> {
  assert.equal(typeof valor, "object");
  assert.notEqual(valor, null);
  return valor as Record<string, unknown>;
}

function coincidePedido(filtro: Record<string, unknown>, pedido: PedidoFalso): boolean {
  if (typeof filtro.id === "string" && filtro.id !== pedido.id) return false;
  if (typeof filtro.estado === "string" && filtro.estado !== pedido.estado) return false;
  if (typeof filtro.metodoPago === "string" && filtro.metodoPago !== pedido.metodoPago) return false;
  if (typeof filtro.stockReservado === "boolean" && filtro.stockReservado !== pedido.stockReservado) return false;

  if (filtro.estadoPago !== undefined) {
    const estado = filtro.estadoPago;
    if (typeof estado === "string" && estado !== pedido.estadoPago) return false;
    if (typeof estado === "object" && estado !== null) {
      const condicion = registro(estado);
      if (typeof condicion.not === "string" && pedido.estadoPago === condicion.not) return false;
    }
  }

  if (filtro.reservaExpiraEn !== undefined) {
    const condicion = filtro.reservaExpiraEn;
    if (condicion === null) {
      if (pedido.reservaExpiraEn !== null) return false;
    } else if (typeof condicion === "object" && condicion !== null) {
      const rango = registro(condicion);
      if (rango.lte instanceof Date &&
        (!pedido.reservaExpiraEn || pedido.reservaExpiraEn > rango.lte)) return false;
      if (rango.gt instanceof Date &&
        (!pedido.reservaExpiraEn || pedido.reservaExpiraEn <= rango.gt)) return false;
    }
  }

  if (Array.isArray(filtro.OR)) {
    const coincideUna = filtro.OR.some((alternativa) => {
      const condicion = registro(alternativa);
      if (condicion.reservaExpiraEn !== undefined) return coincidePedido(condicion, pedido);
      if (typeof condicion.metodoPago === "object" && condicion.metodoPago !== null) {
        return pedido.metodoPago !== registro(condicion.metodoPago).not;
      }
      if (typeof condicion.estadoPago === "object" && condicion.estadoPago !== null) {
        return pedido.estadoPago !== registro(condicion.estadoPago).not;
      }
      return false;
    });
    if (!coincideUna) return false;
  }

  if (Array.isArray(filtro.AND)) {
    for (const item of filtro.AND) {
      const condicion = registro(item);
      if (Array.isArray(condicion.OR) && !condicion.OR.some((alternativa) => {
        const regla = registro(alternativa);
        if (typeof regla.metodoPago === "object" && regla.metodoPago !== null) {
          return pedido.metodoPago !== registro(regla.metodoPago).not;
        }
        if (typeof regla.estadoPago === "object" && regla.estadoPago !== null) {
          return pedido.estadoPago !== registro(regla.estadoPago).not;
        }
        return false;
      })) return false;
    }
  }
  return true;
}

async function verificarPoliticas(): Promise<void> {
  const ahora = new Date("2026-10-23T12:00:00.000Z");
  const politica48 = { vencimiento: { habilitado: true, horas: 48 } };
  assert.equal(obtenerVencimientoReserva("efectivo", ahora, politica48)?.toISOString(), "2026-10-25T12:00:00.000Z");
  assert.equal(obtenerVencimientoReserva("transferencia", ahora, politica48)?.toISOString(), "2026-10-25T12:00:00.000Z");
  assert.equal(obtenerVencimientoReserva("efectivo", ahora, undefined), null,
    "Una configuración existente sin política no debe adoptar vencimiento retroactivo");
  assert.equal(obtenerVencimientoReserva("transferencia", ahora, {
    vencimiento: { habilitado: false, horas: 48 },
  }), null);
  assert.deepEqual(leerPoliticaVencimientoReserva(undefined), { habilitado: false, horas: 48 });
  assert.deepEqual(crearConfigInicialMetodoPago("efectivo"), {
    vencimiento: { habilitado: true, horas: 48 },
  });
  assert.deepEqual(crearConfigInicialMetodoPago("transferencia"), {
    vencimiento: { habilitado: true, horas: 48 },
  });
  assert.equal(crearConfigInicialMetodoPago("mercadopago"), undefined);
  assert.equal(DURACION_RESERVA_MANUAL_HORAS_MINIMA, 1);
  assert.equal(DURACION_RESERVA_MANUAL_HORAS_MAXIMA, 720);
  assert.throws(() => obtenerVencimientoReserva("efectivo", ahora, {
    vencimiento: { habilitado: true, horas: 721 },
  }));
  assert.deepEqual(
    combinarConfigMetodoPago(
      { instrucciones: "CBU previo", campoExtra: { conservar: true } },
      { instrucciones: "CBU actualizado", vencimiento: { habilitado: true, horas: 48 } },
    ),
    {
      instrucciones: "CBU actualizado",
      campoExtra: { conservar: true },
      vencimiento: { habilitado: true, horas: 48 },
    },
    "Editar la política debe conservar las instrucciones y demás claves existentes",
  );

  const configuracionTenantA = { vencimiento: { habilitado: true, horas: 48 } };
  const configuracionTenantB = { vencimiento: { habilitado: true, horas: 24 } };
  const venceTenantA = obtenerVencimientoReserva("transferencia", ahora, configuracionTenantA);
  const venceTenantB = obtenerVencimientoReserva("transferencia", ahora, configuracionTenantB);
  assert.ok(venceTenantA && venceTenantB);
  assert.equal(venceTenantA.getTime() - ahora.getTime(), 48 * 60 * 60 * 1000);
  assert.equal(venceTenantB.getTime() - ahora.getTime(), 24 * 60 * 60 * 1000);
  assert.equal(
    obtenerVencimientoReserva("mercadopago", ahora, { vencimiento: { habilitado: false, horas: 48 } })?.getTime(),
    ahora.getTime() + DURACION_RESERVA_MERCADOPAGO_MS,
    "La política de Mercado Pago debe conservar sus 30 minutos",
  );
}

async function verificarExpiracionIdempotente(): Promise<void> {
  const ahora = new Date("2026-10-23T12:00:00.000Z");
  const vencido = new Date("2026-10-23T11:59:59.000Z");
  const pedidos: PedidoFalso[] = [
    { id: "transferencia-pendiente", estado: "PENDIENTE", estadoPago: "PENDIENTE", metodoPago: "transferencia", stockReservado: true, reservaExpiraEn: vencido },
    { id: "efectivo-pendiente", estado: "PENDIENTE", estadoPago: "PENDIENTE", metodoPago: "efectivo", stockReservado: true, reservaExpiraEn: vencido },
    { id: "mercadopago-pendiente", estado: "PENDIENTE", estadoPago: "EN_ACREDITACION", metodoPago: "mercadopago", stockReservado: true, reservaExpiraEn: vencido },
    { id: "transferencia-en-revision", estado: "PENDIENTE", estadoPago: "EN_ACREDITACION", metodoPago: "transferencia", stockReservado: true, reservaExpiraEn: vencido },
    { id: "pago-aprobado", estado: "PENDIENTE", estadoPago: "APROBADO", metodoPago: "transferencia", stockReservado: true, reservaExpiraEn: vencido },
    { id: "pedido-cancelado", estado: "CANCELADO", estadoPago: "CANCELADO", metodoPago: "transferencia", stockReservado: false, reservaExpiraEn: vencido },
    { id: "sin-fecha-retroactiva", estado: "PENDIENTE", estadoPago: "PENDIENTE", metodoPago: "transferencia", stockReservado: true, reservaExpiraEn: null },
  ];
  const eventos: string[] = [];
  const pagosCancelados: string[] = [];
  const liberaciones: string[] = [];

  const prismaFalso = {
    pedido: {
      async findMany(argumentos: unknown) {
        const where = registro(registro(argumentos).where);
        return pedidos.filter((pedido) => coincidePedido(where, pedido))
          .sort((a, b) => (a.reservaExpiraEn?.getTime() ?? 0) - (b.reservaExpiraEn?.getTime() ?? 0))
          .slice(0, 100)
          .map(({ id, estadoPago }) => ({ id, estadoPago }));
      },
      async updateMany(argumentos: unknown) {
        const raiz = registro(argumentos);
        const where = registro(raiz.where);
        const pedido = pedidos.find((item) => coincidePedido(where, item));
        if (!pedido) return { count: 0 };
        Object.assign(pedido, registro(raiz.data));
        return { count: 1 };
      },
    },
    payment: {
      async updateMany(argumentos: unknown) {
        const where = registro(registro(argumentos).where);
        pagosCancelados.push(String(where.pedidoId));
        return { count: 1 };
      },
    },
    pedidoEvento: {
      async create(argumentos: unknown) {
        const data = registro(registro(argumentos).data);
        eventos.push(String(data.tipo) + ":" + String(data.pedidoId));
        return { id: "evento-" + eventos.length };
      },
    },
    async $transaction<T>(operacion: (tx: unknown) => Promise<T>): Promise<T> {
      return operacion(prismaFalso);
    },
  } as unknown as PrismaClient;

  const expirar = crearExpiradorPedidosPendientes({
    async conPrisma(operacion) { return operacion(prismaFalso); },
    async liberarReservaStockPedido(pedidoId, _tx) {
      const pedido = pedidos.find((item) => item.id === pedidoId);
      if (!pedido || pedido.estado !== "CANCELADO" || !pedido.stockReservado) return false;
      pedido.stockReservado = false;
      liberaciones.push(pedidoId);
      return true;
    },
  });

  assert.equal(await expirar(ahora), 3);
  assert.deepEqual(liberaciones.sort(), ["efectivo-pendiente", "mercadopago-pendiente", "transferencia-pendiente"]);
  assert.equal(pedidos.find((pedido) => pedido.id === "transferencia-en-revision")?.estado, "PENDIENTE");
  assert.equal(pedidos.find((pedido) => pedido.id === "pago-aprobado")?.estado, "PENDIENTE");
  assert.equal(pedidos.find((pedido) => pedido.id === "sin-fecha-retroactiva")?.estado, "PENDIENTE");
  assert.equal(await expirar(ahora), 0, "Una segunda ejecución no debe volver a liberar stock");
  assert.equal(eventos.length, 3);
  assert.equal(pagosCancelados.length, 3);
}

async function main(): Promise<void> {
  await verificarPoliticas();
  await verificarExpiracionIdempotente();
  console.log("Vencimientos y expiración verificados con dobles en memoria; no se consultó una base real.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
