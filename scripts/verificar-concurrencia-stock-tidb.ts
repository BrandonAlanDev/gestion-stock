import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { PrismaClient } from "../generated/prisma/client";
import { conPrismaTenant } from "../src/lib/prisma";
import { ErrorItemCarrito } from "../src/lib/pedidos/resolver-items-carrito";
import { crearPedidoDesdeCarrito } from "../src/lib/pedidos/crear-pedido";
import {
  ErrorConflictoReservaStock,
  ErrorStockInsuficiente,
} from "../src/lib/inventario/stock-condicional";
import {
  confirmarReservaStockPedido,
  liberarReservaStockPedido,
  reservarStockPedido,
} from "../src/lib/pedidos/gestionar-reserva-stock";
import type { MetodoPagoId } from "../src/lib/pagos/tipos";

type IdentidadBase = {
  base: string | null;
  version: string;
  modo: string;
};

type VariantePrueba = { garmentId: string; variantId: string; precio: number };

type Fixture = {
  categoriaId: string;
  usuarios: string[];
  prendas: string[];
  variantes: Record<string, VariantePrueba>;
};

const TOKEN = randomUUID().replaceAll("-", "");
const PREFIJO = `__inventario_concurrencia_${TOKEN}`;
const TOKEN_ROLLBACK = "FALLO_CONTROLADO_INTEGRACION_STOCK";
const TOKEN_CHECK_NO_APLICADO = "CHECK_STOCK_NO_APLICADO";

function exigirEntornoConfirmado(): { tenantId: string; baseEsperada: string } {
  const tenantId = process.env.INVENTARIO_TEST_TENANT_ID?.trim();
  const baseEsperada = process.env.INVENTARIO_TEST_DATABASE_NAME?.trim();
  if (!tenantId || !baseEsperada) {
    throw new Error(
      "Definí INVENTARIO_TEST_TENANT_ID e INVENTARIO_TEST_DATABASE_NAME para seleccionar una base de ensayo explícita.",
    );
  }
  if (!/(^|[_-])(test|testing|prueba|ensayo)([_-]|$)/i.test(baseEsperada)) {
    throw new Error("El nombre esperado de la base debe identificarla explícitamente como test, prueba o ensayo.");
  }
  if (process.env.TENANT_TIDB_TXN_MODE !== "pessimistic") {
    throw new Error("La prueba requiere TENANT_TIDB_TXN_MODE=pessimistic antes de crear el pool Prisma.");
  }
  return { tenantId, baseEsperada };
}

async function pedirConfirmacion(pregunta: string, valorEsperado: string): Promise<void> {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("La prueba requiere una terminal interactiva para confirmar el destino y las escrituras.");
  }

  const interfaz = createInterface({ input: stdin, output: stdout });
  try {
    const respuesta = await interfaz.question(`${pregunta}\n> `);
    if (respuesta.trim() !== valorEsperado) {
      throw new Error("Confirmación distinta de la esperada; no se realizaron escrituras.");
    }
  } finally {
    interfaz.close();
  }
}

async function obtenerIdentidadYMetodo(
  tenantId: string,
): Promise<{ identidad: IdentidadBase; metodoPago: MetodoPagoId }> {
  return conPrismaTenant(tenantId, async (prisma) => {
    const [identidad] = await prisma.$queryRaw<IdentidadBase[]>`
      SELECT
        DATABASE() AS base,
        VERSION() AS version,
        @@SESSION.tidb_txn_mode AS modo
    `;
    const metodos = await prisma.metodoPago.findMany({
      where: { activo: true, metodo: { in: ["transferencia", "efectivo", "mercadopago"] } },
      select: { metodo: true },
    });
    const metodoPago = (["transferencia", "efectivo", "mercadopago"] as const)
      .find((metodo) => metodos.some((fila) => fila.metodo === metodo));
    return { identidad, metodoPago };
  }).then(({ identidad, metodoPago }) => {
    if (!metodoPago) throw new Error("La base de ensayo no tiene un método de pago activo para el checkout.");
    return { identidad, metodoPago: metodoPago as MetodoPagoId };
  });
}

function crearDatosPrenda(
  categoriaId: string,
  nombre: string,
  precio: number,
  controlaStock: boolean,
  stock: number,
) {
  return {
    name: nombre,
    price: precio,
    cost: 0,
    categoryId: categoriaId,
    active: true,
    controlaStock,
    variants: { create: { stock } },
  };
}

async function crearFixture(tenantId: string, cantidadUsuarios: number): Promise<Fixture> {
  return conPrismaTenant(tenantId, async (prisma) => prisma.$transaction(async (tx) => {
    const categoria = await tx.category.create({ data: { name: `${PREFIJO}_categoria` } });
    await tx.user.createMany({
      data: Array.from({ length: cantidadUsuarios }, (_, indice) => ({
        name: `Prueba inventario ${indice + 1}`,
        email: `${PREFIJO}_${indice + 1}@example.invalid`,
      })),
    });
    const usuarios = await tx.user.findMany({
      where: { email: { startsWith: `${PREFIJO}_` } },
      orderBy: { email: "asc" },
      select: { id: true },
    });
    assert.equal(usuarios.length, cantidadUsuarios, "no se pudieron crear todos los usuarios aislados");

    const prendas: string[] = [];
    const variantes: Fixture["variantes"] = {};
    const crearPrenda = async (
      clave: string,
      precio: number,
      controlaStock: boolean,
      stock: number,
    ) => {
      const prenda = await tx.garment.create({
        data: crearDatosPrenda(categoria.id, `${PREFIJO}_${clave}`, precio, controlaStock, stock),
        select: { id: true, variants: { select: { id: true } } },
      });
      const variantId = prenda.variants[0]?.id;
      if (!variantId) throw new Error("No se creó la variante aislada de la prueba.");
      prendas.push(prenda.id);
      variantes[clave] = { garmentId: prenda.id, variantId, precio };
    };

    await crearPrenda("cinco", 100, true, 1);
    await crearPrenda("diez", 110, true, 1);
    await crearPrenda("veinte", 120, true, 1);
    await crearPrenda("multi_a", 130, true, 1);
    await crearPrenda("multi_b", 140, true, 1);
    await crearPrenda("confirmar", 155, true, 1);
    await crearPrenda("check_no_negativo", 165, true, 1);
    await crearPrenda("sin_control", 150, false, 7);
    await crearPrenda("rollback", 160, true, 1);

    return {
      categoriaId: categoria.id,
      usuarios: usuarios.map((usuario) => usuario.id),
      prendas,
      variantes,
    };
  }));
}

async function comprar(
  tenantId: string,
  metodoPago: MetodoPagoId,
  usuarioId: string,
  lineas: Array<{ variante: VariantePrueba; cantidad: number }>,
) {
  const items = lineas.map(({ variante, cantidad }, indice) => ({
    clave: `linea-${indice + 1}`,
    productId: variante.garmentId,
    variantId: variante.variantId,
    cantidad,
  }));
  const subtotal = lineas.reduce((total, linea) => total + linea.variante.precio * linea.cantidad, 0);
  return crearPedidoDesdeCarrito(
    tenantId,
    usuarioId,
    items,
    metodoPago,
    undefined,
    subtotal,
  );
}

async function verificarStock(
  tenantId: string,
  variantId: string,
  esperado: number,
): Promise<void> {
  await conPrismaTenant(tenantId, async (prisma) => {
    const variante = await prisma.garmentVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });
    assert.equal(variante?.stock, esperado, `stock final incorrecto para ${variantId}`);
    assert.ok((variante?.stock ?? -1) >= 0, `stock negativo en ${variantId}`);
  });
}

function detalleError(error: unknown): { codigo: string; mensaje: string } {
  const pendientes: unknown[] = [error];
  const visitados = new Set<object>();
  const fragmentos: string[] = [];
  const codigos: string[] = [];
  while (pendientes.length > 0) {
    const actual = pendientes.pop();
    if (!actual || typeof actual !== "object" || visitados.has(actual)) continue;
    visitados.add(actual);
    const registro = actual as Record<string, unknown>;
    if (typeof registro.message === "string") fragmentos.push(registro.message);
    if (registro.code !== undefined) codigos.push(String(registro.code));
    if (registro.errno !== undefined) codigos.push(String(registro.errno));
    pendientes.push(registro.cause, registro.meta, registro.originalCode);
  }
  return { codigo: codigos.join(" "), mensaje: fragmentos.join(" ") };
}

async function verificarCheckStockNoNegativo(
  tenantId: string,
  variante: VariantePrueba,
): Promise<void> {
  let errorCheck: unknown;
  try {
    await conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (tx) => {
      await tx.garmentVariant.update({
        where: { id: variante.variantId },
        data: { stock: -1 },
      });
      throw new Error(TOKEN_CHECK_NO_APLICADO);
    }));
  } catch (error) {
    if (error instanceof Error && error.message.includes(TOKEN_CHECK_NO_APLICADO)) {
      throw new Error("La base permitió stock -1: falta la CHECK activa o TiDB la tiene deshabilitada.");
    }
    errorCheck = error;
  }

  const detalle = detalleError(errorCheck);
  assert.ok(
    /P2004|3819|4022|ER_CHECK_CONSTRAINT_VIOLATED/i.test(detalle.codigo) ||
      /check constraint|constraint.*violat/i.test(detalle.mensaje),
    `la actualización negativa falló por un motivo distinto de CHECK: ${detalle.mensaje}`,
  );
  await verificarStock(tenantId, variante.variantId, 1);
}

async function ejecutarContienda(
  tenantId: string,
  metodoPago: MetodoPagoId,
  usuarios: string[],
  variante: VariantePrueba,
): Promise<{ pedidoId: string; usuariosPerdedores: string[] }> {
  const resultados = await Promise.allSettled(usuarios.map((usuarioId) =>
    comprar(tenantId, metodoPago, usuarioId, [{ variante, cantidad: 1 }]),
  ));
  const pedidosExitosos = resultados.flatMap((resultado, indice) => {
    if (resultado.status !== "fulfilled" || !resultado.value.ok) return [];
    return [{ pedidoId: resultado.value.pedidoId, usuarioId: usuarios[indice]! }];
  });
  assert.equal(pedidosExitosos.length, 1, `${usuarios.length} solicitudes deben crear un solo pedido`);

  for (const resultado of resultados) {
    if (resultado.status === "rejected") {
      assert.ok(
        resultado.reason instanceof ErrorItemCarrito ||
          resultado.reason instanceof ErrorStockInsuficiente ||
          resultado.reason instanceof ErrorConflictoReservaStock,
        "los rechazos de concurrencia deben ser errores controlados de stock",
      );
    }
  }

  await conPrismaTenant(tenantId, async (prisma) => {
    const pedidos = await prisma.pedido.findMany({
      where: { userId: { in: usuarios } },
      select: { id: true, stockReservado: true },
    });
    assert.equal(pedidos.length, 1, "solo debe persistir el pedido ganador");
    assert.equal(pedidos[0]?.stockReservado, true);

    const items = await prisma.pedidoItem.findMany({
      where: { pedidoId: pedidos[0]!.id },
      select: { variantId: true, cantidad: true, stockReservado: true },
    });
    assert.equal(items.length, 1);
    assert.equal(items[0]?.variantId, variante.variantId);
    assert.equal(items[0]?.cantidad, 1);
    assert.equal(items[0]?.stockReservado, true);

    const movimientos = await prisma.movement.findMany({
      where: {
        variantId: variante.variantId,
        note: `Reserva · pedido ${pedidos[0]!.id}`,
      },
      select: { type: true, quantity: true },
    });
    assert.deepEqual(movimientos, [{ type: "OUT", quantity: 1 }]);
  });
  await verificarStock(tenantId, variante.variantId, 0);
  return {
    pedidoId: pedidosExitosos[0]!.pedidoId,
    usuariosPerdedores: usuarios.filter((usuarioId) => usuarioId !== pedidosExitosos[0]!.usuarioId),
  };
}

async function verificarRollbackForzado(
  tenantId: string,
  fixture: Fixture,
  metodoPago: MetodoPagoId,
  usuarioId: string,
): Promise<void> {
  const variante = fixture.variantes.rollback!;
  let pedidoId: string | null = null;
  const operacion = conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (tx) => {
    const numero = await tx.numeroPedido.create({ data: {} });
    const pedido = await tx.pedido.create({
      data: {
        numero: numero.id,
        userId: usuarioId,
        metodoPago,
        total: variante.precio,
        subtotal: variante.precio,
        moneda: "ARS",
        estado: "PENDIENTE",
        estadoPago: "PENDIENTE",
        stockReservado: true,
        items: {
          create: {
            garmentId: variante.garmentId,
            variantId: variante.variantId,
            nombre: `${PREFIJO}_rollback`,
            varianteNombre: "8US",
            precioUnitario: variante.precio,
            cantidad: 1,
            subtotal: variante.precio,
          },
        },
      },
      select: { id: true },
    });
    pedidoId = pedido.id;
    await reservarStockPedido(pedido.id, [{
      variantId: variante.variantId,
      nombre: `${PREFIJO}_rollback`,
      cantidad: 1,
      precioUnitario: variante.precio,
    }], tx);
    throw new Error(TOKEN_ROLLBACK);
  }));

  await assert.rejects(operacion, (error: unknown) =>
    error instanceof Error && error.message.includes(TOKEN_ROLLBACK),
  );
  await verificarStock(tenantId, variante.variantId, 1);
  await conPrismaTenant(tenantId, async (prisma) => {
    assert.equal(await prisma.pedido.count({ where: { id: pedidoId ?? "" } }), 0);
    assert.equal(await prisma.movement.count({ where: { variantId: variante.variantId } }), 0);
  });
}

async function verificarPedidoMultiProducto(
  tenantId: string,
  metodoPago: MetodoPagoId,
  fixture: Fixture,
): Promise<void> {
  const usuarios = fixture.usuarios.slice(35, 37);
  const multi = comprar(tenantId, metodoPago, usuarios[0]!, [
    { variante: fixture.variantes.multi_a!, cantidad: 1 },
    { variante: fixture.variantes.multi_b!, cantidad: 1 },
    { variante: fixture.variantes.sin_control!, cantidad: 2 },
  ]);
  const soloB = comprar(tenantId, metodoPago, usuarios[1]!, [
    { variante: fixture.variantes.multi_b!, cantidad: 1 },
  ]);
  const resultados = await Promise.allSettled([multi, soloB]);
  const exitosos = resultados.filter((resultado) =>
    resultado.status === "fulfilled" && resultado.value.ok,
  );
  assert.equal(exitosos.length, 1, "solo una compra concurrente debe reservar la variante compartida");

  const [stockA, stockB, stockSinControl] = await conPrismaTenant(tenantId, async (prisma) => {
    const ids = ["multi_a", "multi_b", "sin_control"] as const;
    const filas = await prisma.garmentVariant.findMany({
      where: { id: { in: ids.map((id) => fixture.variantes[id]!.variantId) } },
      select: { id: true, stock: true },
    });
    const mapa = new Map(filas.map((fila) => [fila.id, fila.stock]));
    return ids.map((id) => mapa.get(fixture.variantes[id]!.variantId));
  });
  assert.ok(stockA === 0 || stockA === 1);
  assert.equal(stockB, 0);
  assert.equal(stockSinControl, 7, "el producto sin seguimiento conserva el stock manual actual");

  const [movimientosA, movimientosB, movimientosSinControl] = await conPrismaTenant(tenantId, async (prisma) => {
    const ids = ["multi_a", "multi_b", "sin_control"] as const;
    return Promise.all(ids.map((id) => prisma.movement.count({
      where: { variantId: fixture.variantes[id]!.variantId },
    })));
  });
  assert.equal(movimientosA, stockA === 0 ? 1 : 0, "un pedido fallido no deja movimientos parciales");
  assert.equal(movimientosB, 1);
  assert.equal(movimientosSinControl, 0);
  await conPrismaTenant(tenantId, async (prisma) => {
    const pedidos = await prisma.pedido.findMany({
      where: { userId: { in: usuarios } },
      select: { id: true },
    });
    assert.equal(pedidos.length, 1, "solo debe persistir el pedido multivariante ganador");
  });
}

async function verificarConfirmacionIdempotente(
  tenantId: string,
  metodoPago: MetodoPagoId,
  usuarioId: string,
  variante: VariantePrueba,
): Promise<void> {
  const compra = await comprar(tenantId, metodoPago, usuarioId, [{ variante, cantidad: 1 }]);
  assert.ok(compra.ok, "el pedido de confirmación debe reservar stock");
  await conPrismaTenant(tenantId, async (prisma) => {
    await prisma.$transaction(async (tx) => {
      const confirmado = await tx.pedido.updateMany({
        where: { id: compra.pedidoId, estado: "PENDIENTE", stockReservado: true },
        data: { estado: "CONFIRMADO", estadoPago: "APROBADO", stockReservado: false },
      });
      assert.equal(confirmado.count, 1);
      await confirmarReservaStockPedido(compra.pedidoId, tx);
      await confirmarReservaStockPedido(compra.pedidoId, tx);
    });
    const movimientos = await prisma.movement.findMany({
      where: { variantId: variante.variantId },
      select: { type: true, quantity: true, note: true },
    });
    assert.deepEqual(movimientos, [{
      type: "OUT",
      quantity: 1,
      note: `Venta · pedido ${compra.pedidoId}`,
    }], "la confirmación repetida conserva un único movimiento de venta");
    const item = await prisma.pedidoItem.findFirst({
      where: { pedidoId: compra.pedidoId },
      select: { stockReservado: true },
    });
    assert.equal(item?.stockReservado, false);
  });
  await verificarStock(tenantId, variante.variantId, 0);
}

async function limpiarFixture(tenantId: string, fixture: Fixture): Promise<void> {
  await conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (tx) => {
    const pedidos = await tx.pedido.findMany({
      where: { userId: { in: fixture.usuarios } },
      select: { id: true, numero: true },
    });
    const pedidoIds = pedidos.map((pedido) => pedido.id);
    const numeros = pedidos.flatMap((pedido) => pedido.numero === null ? [] : [pedido.numero]);
    const variantes = await tx.garmentVariant.findMany({
      where: { garmentId: { in: fixture.prendas } },
      select: { id: true },
    });
    const variantIds = variantes.map((variante) => variante.id);

    if (variantIds.length > 0) {
      await tx.movement.deleteMany({ where: { variantId: { in: variantIds } } });
    }
    if (pedidoIds.length > 0) {
      await tx.payment.deleteMany({ where: { pedidoId: { in: pedidoIds } } });
      await tx.pedidoEnvio.deleteMany({ where: { pedidoId: { in: pedidoIds } } });
      await tx.pedidoEvento.deleteMany({ where: { pedidoId: { in: pedidoIds } } });
      await tx.pedidoItem.deleteMany({ where: { pedidoId: { in: pedidoIds } } });
      await tx.pedido.deleteMany({ where: { id: { in: pedidoIds } } });
    }
    if (numeros.length > 0) {
      await tx.numeroPedido.deleteMany({ where: { id: { in: numeros } } });
    }
    if (fixture.prendas.length > 0) {
      await tx.garmentVariantOptionValue.deleteMany({ where: { variantId: { in: variantIds } } });
      await tx.garmentVariant.deleteMany({ where: { id: { in: variantIds } } });
      await tx.garment.deleteMany({ where: { id: { in: fixture.prendas } } });
    }
    await tx.category.deleteMany({ where: { id: fixture.categoriaId } });
    await tx.user.deleteMany({ where: { id: { in: fixture.usuarios } } });
  }));
}

async function main(): Promise<void> {
  const { tenantId, baseEsperada } = exigirEntornoConfirmado();
  console.log(`Base de ensayo esperada: ${baseEsperada}`);
  const { identidad, metodoPago } = await obtenerIdentidadYMetodo(tenantId);
  assert.equal(identidad.base, baseEsperada, "la base efectiva no coincide con la esperada");
  assert.ok(identidad.version.toLowerCase().includes("tidb"), "el destino no es TiDB");
  assert.equal(identidad.modo.toLowerCase(), "pessimistic", "el pool Prisma no usa modo pesimista efectivo");
  console.log(`Identidad verificada: base=${identidad.base}; motor=${identidad.version}; modo=${identidad.modo}.`);
  await pedirConfirmacion(
    `La conexión verificada es TiDB de ensayo (${identidad.base}). Confirmá las escrituras aisladas escribiendo ESCRIBIR ${identidad.base}.`,
    `ESCRIBIR ${identidad.base}`,
  );

  let fixture: Fixture | null = null;
  try {
    fixture = await crearFixture(tenantId, 39);
    await verificarCheckStockNoNegativo(tenantId, fixture.variantes.check_no_negativo!);
    console.log("OK: TiDB rechazó stock negativo mediante la restricción CHECK y la transacción revirtió.");
    const pruebaCinco = await ejecutarContienda(
      tenantId, metodoPago, fixture.usuarios.slice(0, 5), fixture.variantes.cinco!,
    );
    console.log("OK: 5 solicitudes concurrentes, una reserva.");
    const pruebaDiez = await ejecutarContienda(
      tenantId, metodoPago, fixture.usuarios.slice(5, 15), fixture.variantes.diez!,
    );
    console.log("OK: 10 solicitudes concurrentes, una reserva.");
    await ejecutarContienda(
      tenantId, metodoPago, fixture.usuarios.slice(15, 35), fixture.variantes.veinte!,
    );
    console.log("OK: 20 solicitudes concurrentes, una reserva.");

    await verificarPedidoMultiProducto(tenantId, metodoPago, fixture);
    console.log("OK: carrito multivariante atómico, incluido producto sin seguimiento.");

    await verificarConfirmacionIdempotente(
      tenantId, metodoPago, fixture.usuarios[38]!, fixture.variantes.confirmar!,
    );
    console.log("OK: confirmar dos veces una reserva no duplica el descuento ni el movimiento.");

    await verificarRollbackForzado(tenantId, fixture, metodoPago, fixture.usuarios[37]!);
    console.log("OK: rollback real tras reservar revierte pedido, stock y movimiento.");

    await conPrismaTenant(tenantId, async (prisma) => {
      const pedido = await prisma.pedido.findFirst({
        where: { id: pruebaCinco.pedidoId, estado: "PENDIENTE" },
        select: { id: true },
      });
      assert.ok(pedido, "falta el pedido de prueba para verificar la cancelación");
      await prisma.$transaction(async (tx) => {
        const cancelado = await tx.pedido.updateMany({
          where: { id: pedido.id, estado: "PENDIENTE", stockReservado: true },
          data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
        });
        assert.equal(cancelado.count, 1);
        assert.equal(await liberarReservaStockPedido(pedido.id, tx), true);
      });
      const stockTrasLiberar = await prisma.garmentVariant.findUnique({
        where: { id: fixture!.variantes.cinco!.variantId },
        select: { stock: true },
      });
      assert.equal(stockTrasLiberar?.stock, 1);
      await prisma.$transaction(async (tx) => {
        assert.equal(await liberarReservaStockPedido(pedido.id, tx), false);
      });
      const stockTrasSegundoIntento = await prisma.garmentVariant.findUnique({
        where: { id: fixture!.variantes.cinco!.variantId },
        select: { stock: true },
      });
      assert.equal(stockTrasSegundoIntento?.stock, 1, "la liberación repetida no duplica stock");
    });
    console.log("OK: cancelación restituye una vez y la repetición es idempotente.");

    const reintento = await Promise.allSettled([
      comprar(tenantId, metodoPago, pruebaDiez.usuariosPerdedores[0]!, [
        { variante: fixture.variantes.diez!, cantidad: 1 },
      ]),
    ]);
    assert.equal(reintento.filter((resultado) =>
      resultado.status === "fulfilled" && resultado.value.ok,
    ).length, 0, "repetir la solicitud perdedora no debe reservar una segunda unidad");
    await verificarStock(tenantId, fixture.variantes.diez!.variantId, 0);
    await conPrismaTenant(tenantId, async (prisma) => {
      const pedidos = await prisma.pedido.findMany({
        where: { userId: { in: fixture!.usuarios.slice(5, 15) } },
        select: { id: true },
      });
      assert.equal(pedidos.length, 1, "repetir una solicitud rechazada no debe crear otro pedido");
      const movimientos = await prisma.movement.findMany({
        where: {
          variantId: fixture!.variantes.diez!.variantId,
          note: `Reserva · pedido ${pedidos[0]!.id}`,
        },
        select: { type: true, quantity: true },
      });
      assert.deepEqual(movimientos, [{ type: "OUT", quantity: 1 }]);
    });
    console.log("OK: una solicitud repetida sobre la variante agotada no duplica reserva ni movimiento.");
  } finally {
    if (fixture) await limpiarFixture(tenantId, fixture);
  }
}

void main().catch((error: unknown) => {
  console.error("FALLO prueba de concurrencia de inventario:",
    error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
