import assert from "node:assert/strict";
import type { Prisma, PrismaClient } from "../generated/prisma/client";
import { crearAccionInformarTransferencia } from "../src/lib/actions/pedidos/crear-accion-informar-transferencia";
import { crearExpiradorPedidosPendientes } from "../src/lib/pedidos/expirar-pedidos-pendientes";
import { liberarReservaStockPedido } from "../src/lib/pedidos/gestionar-reserva-stock";
import {
  confirmarPagoManualEnTransaccion,
  rechazarTransferenciaEnTransaccion,
} from "../src/lib/pedidos/transiciones-pago-manual";

interface PedidoFalso {
  id: string;
  userId: string;
  estado: string;
  estadoPago: string;
  metodoPago: string;
  stockReservado: boolean;
  reservaExpiraEn: Date | null;
}

interface PagoFalso {
  proveedor: string;
  estado: string;
}

interface EventoFalso {
  tipo: string;
  descripcion: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  usuarioId: string | null;
  metadata?: unknown;
}

interface EstadoFalso {
  pedido: PedidoFalso;
  pago: PagoFalso;
  eventos: EventoFalso[];
  item: { pedidoId: string; variantId: string; nombre: string; cantidad: number; precioUnitario: number; stockReservado: boolean };
  stock: number;
  movimientos: Array<{ type: string; note: string }>;
  tenantId: string;
}

function objeto(valor: unknown): Record<string, unknown> {
  assert.equal(typeof valor, "object");
  assert.notEqual(valor, null);
  return valor as Record<string, unknown>;
}

function coincide(where: Record<string, unknown>, estado: EstadoFalso): boolean {
  const pedido = estado.pedido;
  for (const clave of ["id", "userId", "estado", "metodoPago"] as const) {
    if (typeof where[clave] === "string" && where[clave] !== pedido[clave]) return false;
  }
  if (typeof where.stockReservado === "boolean" && where.stockReservado !== pedido.stockReservado) return false;

  if (where.estadoPago !== undefined) {
    const filtro = where.estadoPago;
    if (typeof filtro === "string" && filtro !== pedido.estadoPago) return false;
    if (typeof filtro === "object" && filtro !== null) {
      const condicion = objeto(filtro);
      if (typeof condicion.not === "string" && pedido.estadoPago === condicion.not) return false;
      if (Array.isArray(condicion.in) && !condicion.in.includes(pedido.estadoPago)) return false;
    }
  }
  if (where.reservaExpiraEn !== undefined) {
    const filtro = where.reservaExpiraEn;
    if (filtro === null) {
      if (pedido.reservaExpiraEn !== null) return false;
    } else if (typeof filtro === "object" && filtro !== null) {
      const condicion = objeto(filtro);
      if (condicion.gt instanceof Date && (!pedido.reservaExpiraEn || pedido.reservaExpiraEn <= condicion.gt)) return false;
      if (condicion.lte instanceof Date && (!pedido.reservaExpiraEn || pedido.reservaExpiraEn > condicion.lte)) return false;
    }
  }

  if (Array.isArray(where.OR) && !where.OR.some((alternativa) => {
    const filtro = objeto(alternativa);
    if (filtro.reservaExpiraEn !== undefined) return coincide(filtro, estado);
    if (typeof filtro.metodoPago === "object" && filtro.metodoPago !== null) {
      return pedido.metodoPago !== objeto(filtro.metodoPago).not;
    }
    if (typeof filtro.estadoPago === "object" && filtro.estadoPago !== null) {
      return pedido.estadoPago !== objeto(filtro.estadoPago).not;
    }
    return false;
  })) return false;

  if (Array.isArray(where.AND)) {
    for (const condicion of where.AND) {
      const filtro = objeto(condicion);
      if (Array.isArray(filtro.OR) && !filtro.OR.some((alternativa) => {
        const regla = objeto(alternativa);
        if (typeof regla.metodoPago === "object" && regla.metodoPago !== null) {
          return pedido.metodoPago !== objeto(regla.metodoPago).not;
        }
        if (typeof regla.estadoPago === "object" && regla.estadoPago !== null) {
          return pedido.estadoPago !== objeto(regla.estadoPago).not;
        }
        return false;
      })) return false;
    }
  }
  return true;
}

function crearEstado(
  id: string,
  opciones: Partial<PedidoFalso> = {},
  tenantId = "tenant-a",
): EstadoFalso {
  const pedido: PedidoFalso = {
    id,
    userId: "cliente-a",
    estado: "PENDIENTE",
    estadoPago: "PENDIENTE",
    metodoPago: "transferencia",
    stockReservado: true,
    reservaExpiraEn: new Date("2030-10-23T12:00:00.000Z"),
    ...opciones,
  };
  return {
    pedido,
    pago: { proveedor: pedido.metodoPago, estado: pedido.estadoPago },
    eventos: [],
    item: { pedidoId: id, variantId: "variante-a", nombre: "Producto", cantidad: 1, precioUnitario: 100, stockReservado: true },
    stock: 4,
    movimientos: [{ type: "OUT", note: "Reserva · pedido " + id }],
    tenantId,
  };
}

function crearPrismaFalso(estado: EstadoFalso): PrismaClient {
  const prisma = {
    pedido: {
      async findUnique(argumentos: unknown) {
        const where = objeto(objeto(argumentos).where);
        return coincide(where, estado) ? { ...estado.pedido } : null;
      },
      async findFirst(argumentos: unknown) {
        const where = objeto(objeto(argumentos).where);
        return coincide(where, estado) ? { ...estado.pedido } : null;
      },
      async findMany(argumentos: unknown) {
        const where = objeto(objeto(argumentos).where);
        return coincide(where, estado) ? [{ id: estado.pedido.id, estadoPago: estado.pedido.estadoPago }] : [];
      },
      async updateMany(argumentos: unknown) {
        const raiz = objeto(argumentos);
        const where = objeto(raiz.where);
        if (!coincide(where, estado)) return { count: 0 };
        Object.assign(estado.pedido, objeto(raiz.data));
        return { count: 1 };
      },
    },
    payment: {
      async findFirst(argumentos: unknown) {
        const where = objeto(objeto(argumentos).where);
        if (where.pedidoId !== estado.pedido.id || where.proveedor !== estado.pago.proveedor) return null;
        const estadoFiltro = where.estado;
        if (typeof estadoFiltro === "string" && estadoFiltro !== estado.pago.estado) return null;
        if (typeof estadoFiltro === "object" && estadoFiltro !== null) {
          const filtro = objeto(estadoFiltro);
          if (typeof filtro.not === "string" && estado.pago.estado === filtro.not) return null;
          if (Array.isArray(filtro.in) && !filtro.in.includes(estado.pago.estado)) return null;
        }
        return { id: "pago-" + estado.pedido.id };
      },
      async updateMany(argumentos: unknown) {
        const raiz = objeto(argumentos);
        const where = objeto(raiz.where);
        if ((where.id !== undefined && where.id !== "pago-" + estado.pedido.id) ||
          where.pedidoId !== estado.pedido.id || where.proveedor !== estado.pago.proveedor) return { count: 0 };
        const estadoFiltro = where.estado;
        if (typeof estadoFiltro === "string" && estadoFiltro !== estado.pago.estado) return { count: 0 };
        if (typeof estadoFiltro === "object" && estadoFiltro !== null) {
          const filtro = objeto(estadoFiltro);
          if (typeof filtro.not === "string" && estado.pago.estado === filtro.not) return { count: 0 };
          if (Array.isArray(filtro.in) && !filtro.in.includes(estado.pago.estado)) return { count: 0 };
        }
        estado.pago.estado = String(objeto(raiz.data).estado);
        return { count: 1 };
      },
    },
    pedidoEvento: {
      async create(argumentos: unknown) {
        const data = objeto(objeto(argumentos).data);
        estado.eventos.push({
          tipo: String(data.tipo),
          descripcion: String(data.descripcion),
          estadoAnterior: typeof data.estadoAnterior === "string" ? data.estadoAnterior : null,
          estadoNuevo: typeof data.estadoNuevo === "string" ? data.estadoNuevo : null,
          usuarioId: typeof data.usuarioId === "string" ? data.usuarioId : null,
          ...(data.metadata === undefined ? {} : { metadata: data.metadata }),
        });
        return { id: "evento-" + estado.eventos.length };
      },
    },
    pedidoItem: {
      async findMany(argumentos: unknown) {
        const where = objeto(objeto(argumentos).where);
        if (where.pedidoId !== estado.pedido.id ||
          (typeof where.stockReservado === "boolean" && where.stockReservado !== estado.item.stockReservado)) return [];
        return [{ ...estado.item }];
      },
      async updateMany(argumentos: unknown) {
        const raiz = objeto(argumentos);
        const where = objeto(raiz.where);
        if (where.pedidoId !== estado.pedido.id ||
          (typeof where.id === "string" && where.id !== "item-" + estado.pedido.id) ||
          (typeof where.stockReservado === "boolean" && where.stockReservado !== estado.item.stockReservado)) return { count: 0 };
        Object.assign(estado.item, objeto(raiz.data));
        return { count: 1 };
      },
    },
    garmentVariant: {
      async updateMany(argumentos: unknown) {
        const data = objeto(objeto(argumentos).data);
        const stock = objeto(data.stock);
        if (typeof stock.increment === "number") estado.stock += stock.increment;
        if (typeof stock.decrement === "number") {
          if (estado.stock < stock.decrement) return { count: 0 };
          estado.stock -= stock.decrement;
        }
        return { count: 1 };
      },
    },
    movement: {
      async updateMany(argumentos: unknown) {
        const data = objeto(objeto(argumentos).data);
        if (typeof data.note === "string") {
          for (const movimiento of estado.movimientos) movimiento.note = data.note;
        }
        return { count: estado.movimientos.length };
      },
      async create(argumentos: unknown) {
        const data = objeto(objeto(argumentos).data);
        estado.movimientos.push({ type: String(data.type), note: String(data.note) });
        return { id: "movimiento-" + estado.movimientos.length };
      },
    },
    async $transaction<T>(operacion: (tx: unknown) => Promise<T>): Promise<T> {
      return operacion(prisma);
    },
  };
  return prisma as unknown as PrismaClient;
}

function crearAccionCliente(
  estadoPorTenant: Map<string, EstadoFalso>,
  usuarioId = "cliente-a",
  ahora?: () => Date,
) {
  const tenantsUsados: string[] = [];
  const accion = crearAccionInformarTransferencia({
    async obtenerContexto() { return { tenantId: "tenant-a", usuarioId }; },
    async conPrismaTenant<T>(tenantId: string, operacion: (prisma: PrismaClient) => Promise<T>) {
      tenantsUsados.push(tenantId);
      const estado = estadoPorTenant.get(tenantId);
      assert.ok(estado);
      return operacion(crearPrismaFalso(estado));
    },
    ...(ahora ? { ahora } : {}),
  });
  return { accion, tenantsUsados };
}

function crearExpirador(estado: EstadoFalso) {
  const prisma = crearPrismaFalso(estado);
  return crearExpiradorPedidosPendientes({
    async conPrisma(operacion) { return operacion(prisma); },
    liberarReservaStockPedido,
  });
}

async function enTransaccion<T>(estado: EstadoFalso, operacion: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  const prisma = crearPrismaFalso(estado);
  return prisma.$transaction((tx) => operacion(tx as Prisma.TransactionClient));
}

async function verificarAvisoCliente(): Promise<void> {
  const fecha = new Date("2026-10-23T11:59:59.000Z");
  const estado = crearEstado("pedido-a", { reservaExpiraEn: new Date("2026-10-23T12:00:00.000Z") });
  const estados = new Map([["tenant-a", estado]]);
  const { accion, tenantsUsados } = crearAccionCliente(
    estados,
    "cliente-a",
    () => new Date("2026-10-23T11:59:59.000Z"),
  );
  const resultado = await accion("pedido-a");
  assert.deepEqual(resultado, { ok: true, yaInformado: false });
  assert.equal(estado.pedido.estadoPago, "EN_ACREDITACION");
  assert.equal(estado.pago.estado, "EN_ACREDITACION");
  assert.equal(estado.eventos.length, 1);
  assert.equal(estado.eventos[0]?.tipo, "PAGO_EN_ACREDITACION");
  assert.equal(estado.eventos[0]?.usuarioId, "cliente-a");
  assert.equal(estado.eventos[0]?.metadata && objeto(estado.eventos[0]?.metadata).origen, "cliente");
  assert.equal(estado.pedido.reservaExpiraEn?.toISOString(), "2026-10-23T12:00:00.000Z",
    "Informar el pago no puede extender la reserva");
  assert.deepEqual(tenantsUsados, ["tenant-a"]);
  assert.ok(fecha < (estado.pedido.reservaExpiraEn ?? fecha));

  const repetido = await accion("pedido-a");
  assert.deepEqual(repetido, { ok: true, yaInformado: true });
  assert.equal(estado.eventos.length, 1, "El aviso repetido no debe crear eventos");
}

async function verificarAutorizacionYVencimiento(): Promise<void> {
  const expira = new Date("2026-10-23T12:00:00.000Z");
  const estado = crearEstado("pedido-propio", { reservaExpiraEn: expira });
  const estadoOtroTenant = crearEstado("pedido-ajeno", {}, "tenant-b");
  const mapa = new Map([["tenant-a", estado]]);
  const { accion, tenantsUsados } = crearAccionCliente(mapa);
  const ajeno = await accion("pedido-ajeno");
  assert.equal(ajeno.ok, false);
  assert.equal(estadoOtroTenant.pedido.estadoPago, "PENDIENTE");
  assert.deepEqual(tenantsUsados, ["tenant-a"]);

  const otroUsuario = crearAccionInformarTransferencia({
    async obtenerContexto() { return { tenantId: "tenant-a", usuarioId: "cliente-distinto" }; },
    async conPrismaTenant<T>(_tenantId: string, operacion: (prisma: PrismaClient) => Promise<T>) {
      return operacion(crearPrismaFalso(estado));
    },
  });
  assert.equal((await otroUsuario("pedido-propio")).ok, false);
  assert.equal(estado.pedido.estadoPago, "PENDIENTE");

  const conHoraVencida = crearAccionInformarTransferencia({
    async obtenerContexto() { return { tenantId: "tenant-a", usuarioId: "cliente-a" }; },
    async conPrismaTenant<T>(_tenantId: string, operacion: (prisma: PrismaClient) => Promise<T>) {
      return operacion(crearPrismaFalso(estado));
    },
    ahora: () => expira,
  });
  const vencido = await conHoraVencida("pedido-propio");
  assert.equal(vencido.ok, false);
  assert.equal(estado.pedido.estadoPago, "PENDIENTE");
  assert.equal(estado.eventos.length, 0);
}

async function verificarSolicitudesConcurrentes(): Promise<void> {
  const estado = crearEstado("pedido-concurrente");
  const { accion } = crearAccionCliente(
    new Map([["tenant-a", estado]]),
    "cliente-a",
    () => new Date("2026-10-23T11:59:59.000Z"),
  );
  const resultados = await Promise.all([accion("pedido-concurrente"), accion("pedido-concurrente")]);
  assert.equal(estado.pedido.estadoPago, "EN_ACREDITACION");
  assert.equal(estado.eventos.length, 1, "Dos solicitudes paralelas producen una sola transición y evento");
  assert.equal(resultados.filter((resultado) => resultado.ok).length, 2);
}

async function verificarCarreraConCron(): Promise<void> {
  const limite = new Date("2026-10-23T12:00:00.000Z");
  const estado = crearEstado("pedido-carrera", { reservaExpiraEn: limite });
  const expirar = crearExpirador(estado);
  const reporte = crearAccionInformarTransferencia({
    async obtenerContexto() { return { tenantId: "tenant-a", usuarioId: "cliente-a" }; },
    async conPrismaTenant<T>(_tenantId: string, operacion: (prisma: PrismaClient) => Promise<T>) {
      return operacion(crearPrismaFalso(estado));
    },
    ahora: () => new Date(limite.getTime() - 1),
  });
  await Promise.all([reporte("pedido-carrera"), expirar(limite)]);
  assert.ok(["CANCELADO", "PENDIENTE"].includes(estado.pedido.estado));
  assert.equal(estado.eventos.length <= 1, true);
  if (estado.pedido.estadoPago === "EN_ACREDITACION") {
    assert.equal(estado.pedido.estado, "PENDIENTE");
    assert.equal(estado.pedido.stockReservado, true);
    assert.equal(estado.movimientos.filter((item) => item.type === "IN").length, 0);
  } else {
    assert.equal(estado.pedido.estado, "CANCELADO");
    assert.equal(estado.pedido.stockReservado, false);
    assert.equal(estado.movimientos.filter((item) => item.type === "IN").length, 1);
  }
}

async function verificarRevisionYRechazo(): Promise<void> {
  const estado = crearEstado("pedido-rechazo");
  const informar = crearAccionCliente(new Map([["tenant-a", estado]]));
  assert.deepEqual(await informar.accion("pedido-rechazo"), { ok: true, yaInformado: false });
  assert.equal(estado.eventos[0]?.usuarioId, "cliente-a");

  const rechazada = await enTransaccion(estado, (tx) =>
    rechazarTransferenciaEnTransaccion(tx, estado.pedido.id, "admin-a"),
  );
  assert.equal(rechazada, true);
  assert.equal(estado.pedido.estado, "CANCELADO");
  assert.equal(estado.pedido.estadoPago, "RECHAZADO");
  assert.equal(estado.pago.estado, "RECHAZADO");
  assert.equal(estado.pedido.stockReservado, false);
  assert.equal(estado.stock, 5);
  assert.equal(estado.movimientos.filter((item) => item.type === "IN").length, 1);

  const { accion } = crearAccionCliente(new Map([["tenant-a", estado]]));
  assert.equal((await accion("pedido-rechazo")).ok, false);
  assert.equal(await enTransaccion(estado, (tx) =>
    rechazarTransferenciaEnTransaccion(tx, estado.pedido.id, "admin-a"),
  ), false);
  assert.equal(estado.eventos.length, 2, "Un pedido rechazado no admite reaviso ni doble rechazo");
  assert.equal(estado.stock, 5, "El stock rechazado se libera una sola vez");
}

async function verificarAprobacionConcurrenteYCron(): Promise<void> {
  const limite = new Date("2026-10-23T12:00:00.000Z");
  const estado = crearEstado("pedido-aprobacion", { reservaExpiraEn: limite });
  const aprobare = () => enTransaccion(estado, (tx) =>
    confirmarPagoManualEnTransaccion(tx, estado.pedido.id, "admin", () => new Date(limite.getTime() - 1)),
  );
  const resultados = await Promise.all([
    aprobare(),
    aprobare(),
    crearExpirador(estado)(limite),
  ]);
  const accionesGanadoras = resultados.filter((valor) => valor === true).length +
    resultados.reduce<number>((total, valor) => total + (typeof valor === "number" ? valor : 0), 0);
  assert.equal(accionesGanadoras, 1);
  assert.equal(estado.eventos.length, 1);
  assert.ok(estado.pedido.estado === "CONFIRMADO" || estado.pedido.estado === "CANCELADO");
  if (estado.pedido.estado === "CONFIRMADO") {
    assert.equal(estado.pedido.estadoPago, "APROBADO");
    assert.equal(estado.pago.estado, "APROBADO");
    assert.equal(estado.pedido.stockReservado, false);
    assert.equal(estado.stock, 4, "La aprobación convierte la reserva en venta sin devolver stock");
  } else {
    assert.equal(estado.pedido.estadoPago, "CANCELADO");
    assert.equal(estado.pedido.stockReservado, false);
    assert.equal(estado.stock, 5, "Si cron gana, la reserva se libera una vez");
  }
}

async function verificarAprobacionVencidaYCancelada(): Promise<void> {
  const vencido = crearEstado("pedido-vencido", { reservaExpiraEn: new Date("2026-10-23T10:00:00.000Z") });
  assert.equal(await enTransaccion(vencido, (tx) =>
    confirmarPagoManualEnTransaccion(tx, vencido.pedido.id, "admin", () => new Date("2026-10-23T12:00:00.000Z")),
  ), false);
  assert.equal(vencido.pedido.estado, "PENDIENTE");

  const enRevisionVencida = crearEstado("pedido-revision-vencida", {
    estadoPago: "EN_ACREDITACION",
    reservaExpiraEn: new Date("2026-10-23T10:00:00.000Z"),
  });
  enRevisionVencida.pago.estado = "EN_ACREDITACION";
  assert.equal(await enTransaccion(enRevisionVencida, (tx) =>
    confirmarPagoManualEnTransaccion(tx, enRevisionVencida.pedido.id, "admin", () => new Date("2026-10-23T12:00:00.000Z")),
  ), true, "Una transferencia informada antes del plazo sigue pudiendo aprobarse después");
  assert.equal(enRevisionVencida.pedido.estado, "CONFIRMADO");

  const cancelado = crearEstado("pedido-cancelado", { estado: "CANCELADO", estadoPago: "RECHAZADO", stockReservado: false });
  assert.equal(await enTransaccion(cancelado, (tx) =>
    confirmarPagoManualEnTransaccion(tx, cancelado.pedido.id, "admin", () => new Date()),
  ), false);
}

async function main(): Promise<void> {
  await verificarAvisoCliente();
  await verificarAutorizacionYVencimiento();
  await verificarSolicitudesConcurrentes();
  await verificarCarreraConCron();
  await verificarRevisionYRechazo();
  await verificarAprobacionConcurrenteYCron();
  await verificarAprobacionVencidaYCancelada();
  console.log("Transferencias y concurrencia verificadas con dobles en memoria. No se usó MySQL/MariaDB ni se realizaron pagos.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
