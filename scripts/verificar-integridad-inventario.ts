import assert from "node:assert/strict";
import type { Prisma, PrismaClient } from "../generated/prisma/client";
import { actualizarVarianteConControlStock } from "../src/lib/inventario/actualizar-stock-variante";
import { registrarAperturaStock } from "../src/lib/inventario/registrar-apertura-stock";
import {
  bloquearVariantes,
  ErrorVarianteNoEliminable,
  verificarVariantesEliminables,
} from "../src/lib/inventario/variantes-transaccion";
import { garmentSchema } from "../src/lib/validaciones/esquemas";
import { mensajeStockNoDisponible } from "../src/lib/inventario/stock-condicional";
import { eliminarRegistroPrenda } from "../src/lib/services/prendas/eliminar-registro-prenda";
import {
  liberarReservaStockPedido,
  reservarStockPedido,
} from "../src/lib/pedidos/gestionar-reserva-stock";

const ID_VARIANTE = "variante-a";
const ID_PRENDA = "prenda-a";
const reserva = (variantId: string, nombre: string, cantidad: number) => ({
  variantId,
  nombre,
  cantidad,
  precioUnitario: 1200,
});

function comoTransaccion(valor: Record<string, unknown>): Prisma.TransactionClient {
  return valor as unknown as Prisma.TransactionClient;
}

function textoConsulta(consulta: unknown): string {
  if (Array.isArray(consulta)) return consulta.join(" ");
  if (!consulta || typeof consulta !== "object") return "";
  const valor = consulta as { strings?: unknown; sql?: unknown };
  if (Array.isArray(valor.strings)) return valor.strings.join(" ");
  return typeof valor.sql === "string" ? valor.sql : "";
}

function valoresConsulta(consulta: unknown): unknown[] {
  if (!consulta || typeof consulta !== "object") return [];
  const valores = (consulta as { values?: unknown }).values;
  return Array.isArray(valores) ? valores : [];
}

function crearTransaccionStock(stockInicial: number, controlaStockInicial = true) {
  const movimientos: Array<{ type: string; quantity: number; note: string }> = [];
  const variantes = new Map<string, { stock: number; controlaStock: boolean }>([
    [ID_VARIANTE, { stock: stockInicial, controlaStock: controlaStockInicial }],
  ]);
  const items = new Map<string, { id: string; pedidoId: string; variantId: string; nombre: string; cantidad: number; precioUnitario: number; stockReservado: boolean }>();
  const pedidos = new Map<string, { estado: string; stockReservado: boolean }>();
  let fallarCreacionMovimientos = false;

  const tx = comoTransaccion({
    async $queryRaw(consulta: unknown) {
      const sql = textoConsulta(consulta);
      if (sql.includes("tidb_txn_mode")) return [{ modo: "pessimistic" }];
      if (sql.includes("INNER JOIN Garment")) {
        return valoresConsulta(consulta)
          .filter((id): id is string => typeof id === "string")
          .flatMap((id) => {
            const variante = variantes.get(id);
            return variante ? [{ variantId: id, controlaStock: variante.controlaStock }] : [];
          });
      }
      return valoresConsulta(consulta)
        .filter((id): id is string => typeof id === "string")
        .filter((id) => variantes.has(id))
        .map((id) => ({ id }));
    },
    pedidoItem: {
      async findMany(argumentos: unknown) {
        const where = (argumentos as { where: { pedidoId: string; stockReservado?: boolean } }).where;
        return [...items.values()].filter((item) => item.pedidoId === where.pedidoId &&
          (where.stockReservado === undefined || item.stockReservado === where.stockReservado));
      },
      async updateMany(argumentos: unknown) {
        const raiz = argumentos as {
          where: { id?: string; pedidoId: string; variantId?: { in: string[] }; stockReservado?: boolean };
          data: { stockReservado: boolean };
        };
        let count = 0;
        for (const item of items.values()) {
          if (item.pedidoId !== raiz.where.pedidoId ||
            (raiz.where.id !== undefined && item.id !== raiz.where.id) ||
            (raiz.where.variantId !== undefined && !raiz.where.variantId.in.includes(item.variantId)) ||
            (raiz.where.stockReservado !== undefined && item.stockReservado !== raiz.where.stockReservado)) continue;
          item.stockReservado = raiz.data.stockReservado;
          count += 1;
        }
        return { count };
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
      async findMany(argumentos: unknown) {
        const raiz = argumentos as { where: { id: { in: string[] } } };
        return raiz.where.id.in.flatMap((id) => {
          const variante = variantes.get(id);
          return variante ? [{ id, stock: variante.stock, garment: { controlaStock: variante.controlaStock } }] : [];
        });
      },
      async updateMany(argumentos: unknown) {
        const raiz = argumentos as {
          where: { id: string; stock?: number | { equals?: number; gte?: number } };
          data: { stock?: { increment?: number; decrement?: number } };
        };
        const variante = variantes.get(raiz.where.id);
        if (!variante) return { count: 0 };
        if (typeof raiz.where.stock === "number" && variante.stock !== raiz.where.stock) return { count: 0 };
        if (typeof raiz.where.stock === "object" && raiz.where.stock !== null &&
          ((raiz.where.stock.equals !== undefined && variante.stock !== raiz.where.stock.equals) ||
            (raiz.where.stock.gte !== undefined && variante.stock < raiz.where.stock.gte))) return { count: 0 };
        if (raiz.data.stock?.decrement !== undefined) variante.stock -= raiz.data.stock.decrement;
        if (raiz.data.stock?.increment !== undefined) variante.stock += raiz.data.stock.increment;
        return { count: 1 };
      },
    },
    movement: {
      async create(argumentos: unknown) {
        const data = (argumentos as { data: { type: string; quantity: number; note: string | null } }).data;
        movimientos.push({ type: data.type, quantity: data.quantity, note: data.note ?? "" });
        return { id: `movimiento-${movimientos.length}` };
      },
      async createMany(argumentos: unknown) {
        if (fallarCreacionMovimientos) throw new Error("Fallo simulado al guardar movimientos");
        const raiz = argumentos as { data: Array<{ type: string; quantity: number; note: string | null }> };
        movimientos.push(...raiz.data.map((dato) => ({
          type: dato.type,
          quantity: dato.quantity,
          note: dato.note ?? "",
        })));
        return { count: raiz.data.length };
      },
    },
  });

  return {
    tx,
    movimientos,
    agregarVariante(variantId: string, stock: number, controlaStock = true) {
      variantes.set(variantId, { stock, controlaStock });
    },
    agregarPedido(pedidoId: string, cantidad: number, variantId = ID_VARIANTE, nombre = "Camisa") {
      const id = `item-${pedidoId}-${variantId}`;
      items.set(id, {
        id,
        pedidoId,
        variantId,
        nombre,
        cantidad,
        precioUnitario: 1200,
        stockReservado: false,
      });
      pedidos.set(pedidoId, { estado: "PENDIENTE", stockReservado: true });
    },
    stock: (variantId = ID_VARIANTE) => variantes.get(variantId)?.stock,
    marcarVarianteSinSeguimiento(variantId: string) {
      const variante = variantes.get(variantId);
      if (variante) variante.controlaStock = false;
    },
    activarSeguimientoVariante(variantId: string) {
      const variante = variantes.get(variantId);
      if (variante) variante.controlaStock = true;
    },
    fallarCreacionMovimientos() {
      fallarCreacionMovimientos = true;
    },
    pedido: (pedidoId: string) => pedidos.get(pedidoId),
    item: (pedidoId: string, variantId = ID_VARIANTE) => items.get(`item-${pedidoId}-${variantId}`),
    snapshot() {
      return {
        variantes: new Map([...variantes].map(([id, variante]) => [id, { ...variante }])),
        items: new Map([...items].map(([id, item]) => [id, { ...item }])),
        pedidos: new Map([...pedidos].map(([id, pedido]) => [id, { ...pedido }])),
        movimientos: [...movimientos],
      };
    },
    restaurar(snapshot: ReturnType<typeof this.snapshot>) {
      variantes.clear();
      for (const [id, variante] of snapshot.variantes) variantes.set(id, variante);
      items.clear();
      for (const [id, item] of snapshot.items) items.set(id, item);
      pedidos.clear();
      for (const [id, pedido] of snapshot.pedidos) pedidos.set(id, pedido);
      movimientos.splice(0, movimientos.length, ...snapshot.movimientos);
    },
  };
}

function crearTransaccionActualizacion(stockInicial: number) {
  let stock = stockInicial;
  const movimientos: Array<{ type: string; quantity: number }> = [];
  return {
    tx: comoTransaccion({
      garmentVariant: {
        async updateMany(argumentos: unknown) {
          const raiz = argumentos as {
            where: {
              id: string;
              garmentId: string;
              stock?: number | { equals?: number; gte?: number };
            };
            data: { stock?: { increment: number } };
          };
          if (raiz.where.id !== ID_VARIANTE || raiz.where.garmentId !== ID_PRENDA ||
            (typeof raiz.where.stock === "number" && raiz.where.stock !== stock) ||
            (typeof raiz.where.stock === "object" && raiz.where.stock !== null &&
              ((raiz.where.stock.equals !== undefined && raiz.where.stock.equals !== stock) ||
                (raiz.where.stock.gte !== undefined && stock < raiz.where.stock.gte)))) return { count: 0 };
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

async function verificarCorreccionStockHistoricoNegativo(): Promise<void> {
  assert.equal(
    mensajeStockNoDisponible("Zapatillas 8US"),
    "Ya no hay stock disponible de “Zapatillas 8US”. Actualizá el carrito para continuar.",
  );
  assert.equal(
    mensajeStockNoDisponible(),
    "Ya no hay stock disponible del producto. Actualizá el carrito para continuar.",
  );

  const datos = {
    name: "Producto de prueba",
    price: 100,
    categoryId: "categoria-a",
    controlaStock: true,
    opciones: [],
    images: [],
    variants: [{ id: ID_VARIANTE, stockOriginal: -1, stock: 3 }],
  };
  const validacion = garmentSchema.safeParse(datos);
  assert.equal(validacion.success, true, "el snapshot histórico puede ser negativo si el stock nuevo es válido");

  const stockNuevoNegativo = garmentSchema.safeParse({
    ...datos,
    variants: [{ id: ID_VARIANTE, stockOriginal: -1, stock: -1 }],
  });
  assert.equal(stockNuevoNegativo.success, false, "el formulario no debe aceptar stock nuevo negativo");

  const ajuste = crearTransaccionActualizacion(-1);
  await actualizarVarianteConControlStock(ajuste.tx, {
    variantId: ID_VARIANTE,
    garmentId: ID_PRENDA,
    stockOriginal: -1,
    stockNuevo: 3,
    precio: 1200,
    datos: { sku: "CAM-1" },
  });
  assert.equal(ajuste.stock(), 3, "una corrección explícita debe reemplazar el valor negativo legado");
  assert.deepEqual(ajuste.movimientos, [{ type: "IN", quantity: 4 }]);
}

async function verificarCompraDuranteEdicionYCancelacion(): Promise<void> {
  const estado = crearTransaccionStock(5);
  estado.agregarPedido("pedido-1", 2);
  await reservarStockPedido("pedido-1", [reserva(ID_VARIANTE, "Camisa", 2)], estado.tx);
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
  const resultados = await Promise.allSettled(solicitudes.map((pedidoId) =>
    reservarStockPedido(pedidoId, [reserva(ID_VARIANTE, "Camisa", 2)], estado.tx),
  ));
  assert.equal(resultados.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(resultados.filter(({ status }) => status === "rejected").length, 1);
  assert.equal(estado.stock(), 0, "Dos reservas simultáneas no deben llevar el stock a negativo");
  assert.equal(estado.movimientos.length, 1, "Solo debe registrarse el egreso confirmado");

  const duplicada = crearTransaccionStock(2);
  duplicada.agregarPedido("pedido-reserva-unica", 1);
  await reservarStockPedido(
    "pedido-reserva-unica",
    [reserva(ID_VARIANTE, "Camisa", 1)],
    duplicada.tx,
  );
  await assert.rejects(
    reservarStockPedido(
      "pedido-reserva-unica",
      [reserva(ID_VARIANTE, "Camisa", 1)],
      duplicada.tx,
    ),
    /reserva del pedido ya existe/i,
  );
  assert.equal(duplicada.stock(), 1, "una segunda reserva no debe descontar nuevamente");
  assert.equal(duplicada.movimientos.length, 1, "una segunda reserva no debe duplicar movimientos");

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

async function verificarProductoSinSeguimiento(): Promise<void> {
  const estado = crearTransaccionStock(6, false);
  estado.agregarPedido("pedido-sin-seguimiento", 2);
  await reservarStockPedido(
    "pedido-sin-seguimiento",
    [reserva(ID_VARIANTE, "Producto sin seguimiento", 2)],
    estado.tx,
  );
  assert.equal(estado.stock(), 6, "La venta sin seguimiento no debe cambiar el stock");
  assert.equal(estado.item("pedido-sin-seguimiento")?.stockReservado, false);
  assert.equal(estado.movimientos.length, 0);
}

async function verificarActivacionPosteriorYVenta(): Promise<void> {
  const estado = crearTransaccionStock(6, false);
  estado.activarSeguimientoVariante(ID_VARIANTE);
  await registrarAperturaStock(
    estado.tx,
    [{ variantId: ID_VARIANTE, cantidad: estado.stock() ?? 0, precio: 1200 }],
    "Stock inicial al activar el control de stock",
  );
  estado.agregarPedido("pedido-activado", 2);
  await reservarStockPedido(
    "pedido-activado",
    [reserva(ID_VARIANTE, "Producto activado", 2)],
    estado.tx,
  );
  assert.equal(estado.stock(), 4);
  assert.deepEqual(estado.movimientos.map(({ type, quantity }) => ({ type, quantity })), [
    { type: "IN", quantity: 6 },
    { type: "OUT", quantity: 2 },
  ]);
}

async function verificarStockInsuficienteYFalloAtomico(): Promise<void> {
  const insuficiente = crearTransaccionStock(1);
  insuficiente.agregarPedido("pedido-insuficiente", 2);
  await assert.rejects(reservarStockPedido(
    "pedido-insuficiente",
    [reserva(ID_VARIANTE, "Camisa", 2)],
    insuficiente.tx,
  ), /Ya no hay stock disponible/);
  assert.equal(insuficiente.stock(), 1);
  assert.equal(insuficiente.movimientos.length, 0);

  const fallida = crearTransaccionStock(4);
  fallida.agregarPedido("pedido-fallido", 2);
  fallida.fallarCreacionMovimientos();
  const antes = fallida.snapshot();
  await assert.rejects((async () => {
    try {
      await reservarStockPedido(
        "pedido-fallido",
        [reserva(ID_VARIANTE, "Camisa", 2)],
        fallida.tx,
      );
    } catch (error) {
      fallida.restaurar(antes);
      throw error;
    }
  })(), /Fallo simulado/);
  assert.equal(fallida.stock(), 4, "El fallo debe revertir el descuento de stock");
  assert.equal(fallida.item("pedido-fallido")?.stockReservado, false, "El fallo debe revertir la marca de reserva");
  assert.equal(fallida.movimientos.length, 0, "El fallo no debe dejar movimientos parciales");
}

async function verificarCompraConSeguimientosMixtos(): Promise<void> {
  const estado = crearTransaccionStock(5);
  estado.agregarVariante("variante-b", 3, false);
  estado.agregarPedido("pedido-mixto", 2, ID_VARIANTE, "Camisa con stock");
  estado.agregarPedido("pedido-mixto", 2, "variante-b", "Servicio sin stock");
  await reservarStockPedido("pedido-mixto", [
    reserva(ID_VARIANTE, "Camisa con stock", 2),
    reserva("variante-b", "Servicio sin stock", 2),
  ], estado.tx);
  assert.equal(estado.stock(), 3);
  assert.equal(estado.stock("variante-b"), 3);
  assert.equal(estado.item("pedido-mixto")?.stockReservado, true);
  assert.equal(estado.item("pedido-mixto", "variante-b")?.stockReservado, false);
  assert.equal(estado.movimientos.length, 1, "Solo la variante controlada debe generar un movimiento");
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
    async $queryRaw(consulta: unknown) {
      if (textoConsulta(consulta).includes("tidb_txn_mode")) {
        return [{ modo: "pessimistic" }];
      }
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
    async $queryRaw(consulta: unknown) {
      if (textoConsulta(consulta).includes("tidb_txn_mode")) {
        return [{ modo: "pessimistic" }];
      }
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
  await verificarCorreccionStockHistoricoNegativo();
  await verificarCompraDuranteEdicionYCancelacion();
  await verificarAjustesYStockNoNegativo();
  await verificarProductoSinSeguimiento();
  await verificarActivacionPosteriorYVenta();
  await verificarStockInsuficienteYFalloAtomico();
  await verificarCompraConSeguimientosMixtos();
  await verificarProteccionContraEliminacion();
  console.log("Integridad de inventario: ventas con y sin seguimiento, activación posterior, stock insuficiente, concurrencia, fallo atómico, pedidos mixtos, cancelaciones y referencias verificadas en memoria.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
