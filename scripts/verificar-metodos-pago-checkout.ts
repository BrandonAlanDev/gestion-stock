import assert from "node:assert/strict";
import type { PrismaClient } from "../generated/prisma/client";
import {
  crearAccionIniciarPago,
  type DependenciasIniciarPago,
} from "../src/lib/actions/pago/crear-accion-iniciar-pago";
import { filtrarMetodosDisponibles } from "../src/lib/pagos/filtrar-metodos-disponibles";
import type { ResumenMetodoPago } from "../src/lib/pagos/obtener-metodos-disponibles";
import type { DatosEntrega } from "../src/lib/pedidos/datos-entrega";
import type { MetodoPagoId, PaymentProvider } from "../src/lib/pagos/tipos";
import { esMetodoPagoCompatibleConEntrega } from "../src/lib/pagos/es-metodo-pago-compatible-entrega";

function crearMetodo(
  id: MetodoPagoId,
  opciones: Partial<ResumenMetodoPago> = {},
): ResumenMetodoPago {
  return {
    id,
    nombre: id,
    descripcion: id,
    activo: false,
    requiereConexion: false,
    requiereConfiguracion: false,
    conectado: false,
    ...opciones,
  };
}

function verificarFiltroDeMetodos(): void {
  assert.deepEqual(
    filtrarMetodosDisponibles([crearMetodo("efectivo", { activo: true })]).map(({ id }) => id),
    ["efectivo"],
  );
  assert.deepEqual(
    filtrarMetodosDisponibles([crearMetodo("transferencia", {
      activo: true,
      requiereConfiguracion: true,
      conectado: true,
    })]).map(({ id }) => id),
    ["transferencia"],
  );
  assert.deepEqual(
    filtrarMetodosDisponibles([crearMetodo("transferencia", {
      activo: true,
      requiereConfiguracion: true,
      conectado: false,
    })]),
    [],
  );
  assert.deepEqual(
    filtrarMetodosDisponibles([crearMetodo("mercadopago", {
      activo: false,
      requiereConexion: true,
      conectado: true,
    })]),
    [],
  );
  assert.deepEqual(
    filtrarMetodosDisponibles([crearMetodo("mercadopago", {
      activo: true,
      requiereConexion: true,
      conectado: true,
    })]).map(({ id }) => id),
    ["mercadopago"],
  );
  assert.deepEqual(
    filtrarMetodosDisponibles([
      crearMetodo("efectivo"),
      crearMetodo("transferencia", { requiereConfiguracion: true }),
      crearMetodo("mercadopago", { requiereConexion: true }),
    ]),
    [],
  );
  assert.deepEqual(
    filtrarMetodosDisponibles([
      crearMetodo("transferencia", { activo: true, requiereConfiguracion: true }),
    ]),
    [],
    "Una transferencia activa se oculta cuando falta la configuración bancaria",
  );
  assert.equal(
    filtrarMetodosDisponibles([
      crearMetodo("transferencia", {
        activo: true,
        requiereConfiguracion: true,
        conectado: true,
      }),
    ]).length,
    1,
    "El checkout refleja la configuración bancaria una vez completada",
  );
}

function crearDatosEntrega(metodoEntrega: "DOMICILIO" | "RETIRO_TIENDA"): DatosEntrega {
  if (metodoEntrega === "RETIRO_TIENDA") {
    return { metodoEntrega, nombre: "Cliente", apellido: "Prueba", telefono: "0000000000" };
  }
  return {
    metodoEntrega,
    nombre: "Cliente",
    apellido: "Prueba",
    telefono: "0000000000",
    destinatario: "Cliente Prueba",
    calle: "Calle de prueba",
    numero: "1",
    codigoPostal: "0000",
    localidad: "Localidad",
    provincia: "Provincia",
  };
}

function crearDependencias(metodoDisponible: MetodoPagoId) {
  const metodos: ResumenMetodoPago[] = [crearMetodo(metodoDisponible, { activo: true })];
  const estadosPago: string[] = [];
  const modalidadesUsadas: string[] = [];
  const prismaFalso = {
    pedido: {
      findFirst: async () => ({
        id: "pedido-prueba",
        total: 1200,
        moneda: "ARS",
        reservaExpiraEn: null,
        user: { name: "Cliente Prueba", email: "cliente@example.invalid" },
        items: [{ nombre: "Producto", cantidad: 1, precioUnitario: 1200 }],
      }),
      updateMany: async () => ({ count: 1 }),
    },
    payment: {
      create: async ({ data }: { data: { estado: string } }) => {
        estadosPago.push(data.estado);
        return { id: "payment-prueba" };
      },
      updateMany: async () => ({ count: 1 }),
    },
    $transaction: async (operacion: (tx: never) => Promise<unknown>) => operacion({} as never),
  } as unknown as PrismaClient;
  const proveedor = {
    async crearPago(datos: { tenantId: string }) {
      assert.equal(datos.tenantId, "tenant-prueba");
      return {
        externalId: null,
        checkoutUrl: null,
        instrucciones: "Pagá en efectivo al retirar tu pedido en la tienda.",
        esSandbox: false,
        estado: "PENDIENTE" as const,
      };
    },
  } as unknown as PaymentProvider;
  const dependencias: DependenciasIniciarPago = {
    obtenerContextoTenant: async () => ({ tenantId: "tenant-prueba", usuarioId: "usuario-prueba" }),
    obtenerMetodosPagoDisponibles: async () => metodos,
    obtenerOpcionesEntrega: async () => ({
      domicilioDisponible: true,
      retiroTiendaDisponible: true,
      direccionRetiro: "Calle 1",
    }),
    filtrarMetodosDisponibles: (resumen) =>
      filtrarMetodosDisponibles(resumen).map(({ id }) => ({ id })),
    obtenerBaseUrl: async () => "https://tienda.example.invalid",
    crearPedidoDesdeCarrito: async (_tenantId, _userId, _items, _metodo, datosEntrega) => {
      if (datosEntrega) modalidadesUsadas.push(datosEntrega.metodoEntrega);
      return { pedidoId: "pedido-prueba" };
    },
    conPrismaTenant: async (_tenantId, operacion) => operacion(prismaFalso),
    liberarReservaStockPedido: async () => true,
    obtenerProveedor: (metodo) => {
      assert.equal(metodo, metodoDisponible);
      return proveedor;
    },
    registrarError: (mensaje, detalle) => {
      throw new Error(`${mensaje} ${detalle}`);
    },
  };
  return { dependencias, estadosPago, modalidadesUsadas };
}

async function verificarMetodoManipulado(): Promise<void> {
  const estado = crearDependencias("transferencia");
  const accion = crearAccionIniciarPago(estado.dependencias);
  const resultado = await accion("efectivo", [{
    productId: "producto-prueba",
    variantId: "variante-prueba",
    cantidad: 1,
  }], crearDatosEntrega("RETIRO_TIENDA"));

  assert.deepEqual(resultado, { ok: false, error: "El método de pago no está disponible" });
  assert.deepEqual(estado.estadosPago, []);
  assert.deepEqual(estado.modalidadesUsadas, []);
}

async function verificarEfectivoSoloConRetiro(): Promise<void> {
  assert.equal(esMetodoPagoCompatibleConEntrega("efectivo", "DOMICILIO"), false);
  assert.equal(esMetodoPagoCompatibleConEntrega("efectivo", "RETIRO_TIENDA"), true);
  assert.equal(esMetodoPagoCompatibleConEntrega("transferencia", "DOMICILIO"), true);
  assert.equal(esMetodoPagoCompatibleConEntrega("mercadopago", "DOMICILIO"), true);

  const envio = crearDependencias("efectivo");
  const accionEnvio = crearAccionIniciarPago(envio.dependencias);
  const resultadoEnvio = await accionEnvio("efectivo", [{
    productId: "producto-prueba",
    variantId: "variante-prueba",
    cantidad: 1,
  }], crearDatosEntrega("DOMICILIO"));
  assert.deepEqual(resultadoEnvio, {
    ok: false,
    error: "El efectivo solo está disponible para retiro en tienda.",
  });
  assert.deepEqual(envio.estadosPago, []);
  assert.deepEqual(envio.modalidadesUsadas, []);

  const retiro = crearDependencias("efectivo");
  const accionRetiro = crearAccionIniciarPago(retiro.dependencias);
  const resultadoRetiro = await accionRetiro("efectivo", [{
    productId: "producto-prueba",
    variantId: "variante-prueba",
    cantidad: 1,
  }], crearDatosEntrega("RETIRO_TIENDA"));
  assert.equal(resultadoRetiro.ok, true);
  if (!resultadoRetiro.ok) return;
  assert.equal(resultadoRetiro.checkoutUrl, null);
  assert.equal(resultadoRetiro.instrucciones, "Pagá en efectivo al retirar tu pedido en la tienda.");
  assert.deepEqual(retiro.estadosPago, ["PENDIENTE"]);
  assert.deepEqual(retiro.modalidadesUsadas, ["RETIRO_TIENDA"]);
}

async function main(): Promise<void> {
  verificarFiltroDeMetodos();
  await verificarMetodoManipulado();
  await verificarEfectivoSoloConRetiro();
  console.log("Métodos de checkout: disponibilidad, configuración, método manipulado y efectivo solo con retiro verificados.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
