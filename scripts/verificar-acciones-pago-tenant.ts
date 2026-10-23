import assert from "node:assert/strict";
import type { PrismaClient } from "../generated/prisma/client";
import {
  crearAccionConfirmarPago,
  type DependenciasConfirmarPago,
} from "../src/lib/actions/pago/crear-accion-confirmar-pago";
import {
  crearAccionIniciarPago,
  type DependenciasIniciarPago,
} from "../src/lib/actions/pago/crear-accion-iniciar-pago";
import type { PaymentProvider } from "../src/lib/pagos/tipos";
import { ErrorItemCarrito } from "../src/lib/pedidos/resolver-items-carrito";

const pedidoFalso = {
  id: "pedido-a",
  tenantId: "tenant-a",
  userId: "usuario-a",
  estado: "PENDIENTE",
  estadoPago: "PENDIENTE",
  metodoPago: "mercadopago",
  total: 3500,
  moneda: "ARS",
  reservaExpiraEn: new Date(Date.now() + 30 * 60 * 1000),
  user: { name: "Cliente A", email: "cliente-a@example.com" },
  items: [{ nombre: "Producto A", cantidad: 1, precioUnitario: 3500 }],
};

const datosEntregaRetiro = {
  metodoEntrega: "RETIRO_TIENDA" as const,
  nombre: "Cliente",
  apellido: "Prueba",
  telefono: "0000000000",
};

function crearDependenciasInicioPago(
  contexto: { tenantId: string; usuarioId?: string | null } | null,
  rechazarProductoB = false,
) {
  const tenantsPrisma: string[] = [];
  const tenantsPedidos: string[] = [];
  const tenantDeProveedor: string[] = [];
  const pagoTenant: string[] = [];
  const errores: string[] = [];
  const prismaFalso = {
    pedido: {
      findFirst: async () => {
        return pedidoFalso;
      },
      updateMany: async () => {
        return { count: 1 };
      },
    },
    payment: {
      create: async () => {
        pagoTenant.push(tenantsPrisma[tenantsPrisma.length - 1] ?? "sin-tenant");
        return { id: "pago-a" };
      },
      updateMany: async () => {
        return { count: 1 };
      },
    },
  } as unknown as PrismaClient;
  const proveedor = {
    async crearPago(datos: { tenantId: string }) {
      tenantDeProveedor.push(datos.tenantId);
      return {
        externalId: "operacion-a",
        checkoutUrl: "https://checkout.example.com/a",
        instrucciones: null,
        esSandbox: true,
        estado: "PENDIENTE" as const,
      };
    },
  } as unknown as PaymentProvider;
  const dependencias: DependenciasIniciarPago = {
    obtenerContextoTenant: async () => contexto,
    obtenerMetodosPagoDisponibles: async (tenantId) => {
      tenantsPedidos.push(`metodos:${tenantId}`);
      return [{
        id: "transferencia",
        nombre: "Transferencia",
        descripcion: "Pago manual",
        activo: true,
        requiereConexion: false,
        requiereConfiguracion: false,
        conectado: false,
      }];
    },
    obtenerOpcionesEntrega: async () => ({
      domicilioDisponible: true,
      retiroTiendaDisponible: true,
      direccionRetiro: "Calle 1",
    }),
    filtrarMetodosDisponibles: (metodos) => metodos.filter((metodo) => metodo.activo),
    obtenerBaseUrl: async () => "https://tienda-a.example.com",
    crearPedidoDesdeCarrito: async (tenantId, _userId, items, _metodo, _datosEntrega, subtotalMostrado) => {
      assert.equal(subtotalMostrado, 3500);
      tenantsPedidos.push(`pedido:${tenantId}`);
      if (rechazarProductoB && items.some((item) => item.productId === "producto-b")) {
        throw new ErrorItemCarrito(
          "PRODUCTO_NO_DISPONIBLE",
          "Uno de los productos ya no está disponible.",
        );
      }
      return { ok: true, pedidoId: "pedido-a", numero: 1, total: 3500, moneda: "ARS" };
    },
    conPrismaTenant: async (tenantId, operacion) => {
      tenantsPrisma.push(tenantId);
      return operacion(prismaFalso);
    },
    liberarReservaStockPedido: async () => true,
    obtenerProveedor: () => proveedor,
    registrarError: (_mensaje, detalle) => errores.push(detalle),
  };
  return { dependencias, tenantsPrisma, tenantsPedidos, tenantDeProveedor, pagoTenant, errores };
}

async function verificarInicioSinSesion(): Promise<void> {
  const estado = crearDependenciasInicioPago(null);
  const accion = crearAccionIniciarPago(estado.dependencias);
  const resultado = await accion("transferencia", [], undefined, 3500);

  assert.deepEqual(resultado, {
    ok: false,
    error: "Debés iniciar sesión para confirmar el pago",
  });
  assert.deepEqual(estado.tenantsPrisma, []);
  assert.deepEqual(estado.tenantsPedidos, []);
}

async function verificarInicioDePagoTenantAware(): Promise<void> {
  const estado = crearDependenciasInicioPago({ tenantId: "tenant-a", usuarioId: "usuario-a" });
  const accion = crearAccionIniciarPago(estado.dependencias);
  const resultado = await accion("transferencia", [{
    productId: "producto-a",
    variantId: "variante-a",
    cantidad: 1,
  }], datosEntregaRetiro, 3500);

  assert.deepEqual(resultado, {
    ok: true,
    pedidoId: "pedido-a",
    numero: 1,
    paymentId: "pago-a",
    checkoutUrl: "https://checkout.example.com/a",
    instrucciones: null,
    esSandbox: true,
  });
  assert(estado.tenantsPrisma.length > 0);
  assert(estado.tenantsPrisma.every((tenantId) => tenantId === "tenant-a"));
  assert.deepEqual(estado.tenantsPedidos, ["metodos:tenant-a", "pedido:tenant-a"]);
  assert.deepEqual(estado.pagoTenant, ["tenant-a"]);
  assert.deepEqual(estado.tenantDeProveedor, ["tenant-a"]);
}

async function verificarProductoDeOtroTenantSeRechazaEnTenantActual(): Promise<void> {
  const estado = crearDependenciasInicioPago(
    { tenantId: "tenant-a", usuarioId: "usuario-a" },
    true,
  );
  const accion = crearAccionIniciarPago(estado.dependencias);
  const resultado = await accion("transferencia", [{
    productId: "producto-b",
    variantId: "variante-b",
    cantidad: 1,
  }], datosEntregaRetiro, 3500);

  assert.deepEqual(resultado, {
    ok: false,
    codigo: "PRODUCTO_NO_DISPONIBLE",
    error: "Uno de los productos ya no está disponible.",
  });
  assert.deepEqual(estado.tenantsPedidos, ["metodos:tenant-a", "pedido:tenant-a"]);
  assert.deepEqual(estado.tenantsPrisma, []);
  assert.deepEqual(estado.tenantDeProveedor, []);
}

function crearDependenciasConfirmacion(
  contexto: { tenantId: string; usuarioId?: string | null } | null,
  usuarioPedido = "usuario-a",
  pedidoResuelto = true,
) {
  const tenantsPrisma: string[] = [];
  const tenantsConsultados: string[] = [];
  const tenantsProveedor: string[] = [];
  const tenantsAplicacion: string[] = [];
  const errores: string[] = [];
  const prismaFalso = {
    pedido: {
      findFirst: async (args: { where: { id: string } }) => {
        tenantsConsultados.push(args.where.id);
        if (!pedidoResuelto) return null;
        return { ...pedidoFalso, userId: usuarioPedido };
      },
    },
  } as unknown as PrismaClient;
  const proveedor = {
    async obtenerEstadoPago(tenantId: string) {
      tenantsProveedor.push(tenantId);
      return {
        externalId: "mp-pago-a",
        referencia: "pedido-a",
        estadoExterno: "approved",
        montoPago: 3500,
        monedaPago: "ARS",
      };
    },
  } as unknown as PaymentProvider;
  const dependencias: DependenciasConfirmarPago = {
    obtenerContextoTenant: async () => contexto,
    conPrisma: async (operacion) => {
      const tenantId = contexto?.tenantId ?? "sin-tenant";
      tenantsPrisma.push(tenantId);
      return operacion(prismaFalso);
    },
    obtenerProveedor: () => proveedor,
    aplicarWebhookPago: async (pago) => {
      tenantsAplicacion.push(contexto?.tenantId ?? "sin-tenant");
      assert.equal(pago.pedidoId, "pedido-a");
    },
    registrarError: (_mensaje, detalle) => errores.push(detalle),
  };
  return {
    dependencias,
    tenantsPrisma,
    tenantsConsultados,
    tenantsProveedor,
    tenantsAplicacion,
    errores,
  };
}

async function verificarConfirmacionSinSesion(): Promise<void> {
  const estado = crearDependenciasConfirmacion(null);
  const accion = crearAccionConfirmarPago(estado.dependencias);
  const resultado = await accion("pedido-a", "mp-pago-a");

  assert.deepEqual(resultado, {
    ok: false,
    error: "Iniciá sesión para confirmar tu pago",
  });
  assert.deepEqual(estado.tenantsPrisma, []);
  assert.deepEqual(estado.tenantsConsultados, []);
  assert.deepEqual(estado.tenantsProveedor, []);
}

async function verificarConfirmacionDeOtroUsuario(): Promise<void> {
  const estado = crearDependenciasConfirmacion(
    { tenantId: "tenant-a", usuarioId: "usuario-a" },
    "usuario-b",
  );
  const accion = crearAccionConfirmarPago(estado.dependencias);
  const resultado = await accion("pedido-a", "mp-pago-a");

  assert.deepEqual(resultado, { ok: false, error: "No autorizado" });
  assert.deepEqual(estado.tenantsPrisma, ["tenant-a"]);
  assert.deepEqual(estado.tenantsConsultados, ["pedido-a"]);
  assert.deepEqual(estado.tenantsProveedor, []);
  assert.deepEqual(estado.tenantsAplicacion, []);
}

async function verificarPedidoDeOtroTenantNoLlegaALaPasarela(): Promise<void> {
  const estado = crearDependenciasConfirmacion(
    { tenantId: "tenant-a", usuarioId: "usuario-a" },
    "usuario-a",
    false,
  );
  const accion = crearAccionConfirmarPago(estado.dependencias);
  const resultado = await accion("pedido-b", "mp-pago-b");

  assert.deepEqual(resultado, { ok: false, error: "Pedido no encontrado" });
  assert.deepEqual(estado.tenantsPrisma, ["tenant-a"]);
  assert.deepEqual(estado.tenantsConsultados, ["pedido-b"]);
  assert.deepEqual(estado.tenantsProveedor, []);
  assert.deepEqual(estado.tenantsAplicacion, []);
}

async function verificarConfirmacionDePagoTenantAware(): Promise<void> {
  const estado = crearDependenciasConfirmacion({
    tenantId: "tenant-a",
    usuarioId: "usuario-a",
  });
  const accion = crearAccionConfirmarPago(estado.dependencias);
  const resultado = await accion("pedido-a", "mp-pago-a");

  assert.equal(resultado.ok, true);
  if (!resultado.ok) return;
  assert.equal(resultado.pedido.id, "pedido-a");
  assert.deepEqual(estado.tenantsPrisma, ["tenant-a", "tenant-a"]);
  assert.deepEqual(estado.tenantsConsultados, ["pedido-a", "pedido-a"]);
  assert.deepEqual(estado.tenantsProveedor, ["tenant-a"]);
  assert.deepEqual(estado.tenantsAplicacion, ["tenant-a"]);
}

async function main(): Promise<void> {
  await verificarInicioSinSesion();
  await verificarInicioDePagoTenantAware();
  await verificarProductoDeOtroTenantSeRechazaEnTenantActual();
  await verificarConfirmacionSinSesion();
  await verificarConfirmacionDeOtroUsuario();
  await verificarPedidoDeOtroTenantNoLlegaALaPasarela();
  await verificarConfirmacionDePagoTenantAware();
  console.log("Server Actions de inicio y confirmación de pago: sesión, silo, usuario y pasarela verificados.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
