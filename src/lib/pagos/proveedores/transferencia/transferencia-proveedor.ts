import "server-only";

import { prisma } from "@/lib/prisma";
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
  const metodo = await prisma.metodoPago.findUnique({
    where: {
      tenantId_metodo: { tenantId, metodo: METODO_TRANSFERENCIA },
    },
  });

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
    const configurado = Boolean(configuracion?.instrucciones);
    return { conectado: configurado, nombreCuenta: null, actualizadoEn: null };
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
    const configuracion = await obtenerConfigTransferencia(datos.tenantId);
    return {
      externalId: null,
      checkoutUrl: null,
      instrucciones: configuracion?.instrucciones ?? null,
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
      referencia: null,
      externalId: datos.externalId,
    };
  },
};
