import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import type {
  DatosCrearPago,
  DatosEstadoPago,
  EstadoProveedor,
  PaymentProvider,
  ResultadoCrearPago,
  ResultadoEstadoPago,
} from "@/lib/pagos/tipos";

export const METODO_TRANSFERENCIA = "transferencia";

async function obtenerConfigTransferencia(tenantId: string): Promise<{
  instrucciones: string | null;
} | null> {
  const metodo = await conPrismaTenant(tenantId, (prisma) =>
    prisma.metodoPago.findUnique({
      where: {
        metodo: METODO_TRANSFERENCIA,
      },
      select: { config: true },
    }),
  );

  if (!metodo) return null;

  const config = metodo.config as Record<string, unknown> | null;
  const instrucciones = config?.instrucciones;
  return {
    instrucciones:
      typeof instrucciones === "string" && instrucciones.trim()
        ? instrucciones.trim()
        : null,
  };
}

/** Evalúa la configuración bancaria ya leída, sin consultar nuevamente al tenant. */
export function obtenerEstadoTransferenciaDesdeConfig(config: unknown): EstadoProveedor {
  const datos = typeof config === "object" && config !== null && !Array.isArray(config)
    ? config as Record<string, unknown>
    : null;
  const instrucciones = datos?.instrucciones;
  const configurado = typeof instrucciones === "string" && instrucciones.trim().length > 0;
  return { conectado: configurado, nombreCuenta: null, actualizadoEn: null };
}

/**
 * Implementación de PaymentProvider para transferencia bancaria.
 * No contacta ninguna pasarela externa: registra el pago como PENDIENTE y
 * muestra las instrucciones configuradas por el administrador. La confirmación
 * se realiza de forma manual desde el panel de pedidos.
 */
export const proveedorTransferencia: PaymentProvider = {
  id: "transferencia",

  async obtenerEstado(tenantId: string): Promise<EstadoProveedor> {
    const configuracion = await obtenerConfigTransferencia(tenantId);
    return obtenerEstadoTransferenciaDesdeConfig(configuracion);
  },

  async desconectar(): Promise<void> {
    // La transferencia no tiene cuentas externas que desconectar.
    return Promise.resolve();
  },

  async obtenerUrlConexion(): Promise<string> {
    throw new Error("La transferencia bancaria no requiere conexión externa");
  },

  async manejarCallback(): Promise<void> {
    // No aplica: la transferencia no usa OAuth.
    return Promise.resolve();
  },

  async crearPago(datos: DatosCrearPago): Promise<ResultadoCrearPago> {
    let configuracion: Awaited<ReturnType<typeof obtenerConfigTransferencia>>;
    try {
      configuracion = await obtenerConfigTransferencia(datos.tenantId);
    } catch (error) {
      registrarErrorPagoSeguro(
        "Fallo temporal consultando configuración de transferencia",
        error,
        "transferencia",
      );
      throw new Error("No pudimos verificar la configuración de transferencia. Intentá nuevamente.");
    }
    if (!configuracion?.instrucciones) {
      throw new Error("La transferencia no está configurada. Elegí otro método de pago o intentá más tarde.");
    }
    return {
      externalId: null,
      checkoutUrl: null,
      instrucciones: configuracion.instrucciones,
      esSandbox: false,
      estado: "PENDIENTE",
    };
  },

  async obtenerEstadoPago(
    _tenantId: string,
    datos: DatosEstadoPago,
  ): Promise<ResultadoEstadoPago> {
    return {
      estadoExterno: "pending",
      montoPago: null,
      monedaPago: null,
      referencia: null,
      externalId: datos.externalId,
    };
  },
};
