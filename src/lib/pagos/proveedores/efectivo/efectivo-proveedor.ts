import "server-only";

import type {
  DatosEstadoPago,
  EstadoProveedor,
  PaymentProvider,
  ResultadoCrearPago,
  ResultadoEstadoPago,
} from "@/lib/pagos/tipos";

/** Pago manual en efectivo, confirmado posteriormente por administración. */
export const proveedorEfectivo: PaymentProvider = {
  id: "efectivo",

  async obtenerEstado(): Promise<EstadoProveedor> {
    return { conectado: true, nombreCuenta: null, actualizadoEn: null };
  },

  async desconectar(): Promise<void> {
    // El efectivo no utiliza una cuenta externa.
  },

  async obtenerUrlConexion(): Promise<string> {
    throw new Error("El efectivo no requiere conexión externa");
  },

  async manejarCallback(): Promise<void> {
    throw new Error("El efectivo no admite callbacks externos");
  },

  async crearPago(): Promise<ResultadoCrearPago> {
    return {
      externalId: null,
      checkoutUrl: null,
      instrucciones: "Pagá en efectivo al retirar tu pedido en la tienda.",
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
