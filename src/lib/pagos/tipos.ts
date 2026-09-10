// Tipos base de la capa de pasarela de pagos.
// Este archivo NO exporta funciones; solo tipos/interfaces de dominio,
// para poder ser importado tanto desde el servidor como desde el cliente.

export type MetodoPagoId = "mercadopago" | "transferencia";

export type EstadoPagoId =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "CANCELADO"
  | "EN_ACREDITACION";

export interface ItemPedidoPago {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

/** Datos normalizados que usa el checkout para iniciar un pago. */
export interface DatosCrearPago {
  /** ID interno del registro Payment. */
  paymentId: string;
  pedidoId: string;
  tenantId: string;
  baseUrl: string;
  monto: number;
  moneda: string;
  nombreCliente: string | null;
  emailCliente: string | null;
  items: ItemPedidoPago[];
}

/** Resultado normalizado de crear un pago en un proveedor. */
export interface ResultadoCrearPago {
  /** ID externo en la pasarela (preferenceId, operación, etc.). */
  externalId: string | null;
  /** URL a la que se redirige al cliente (MP Checkout Pro). */
  checkoutUrl: string | null;
  /** Instrucciones para métodos offline (transferencia bancaria). */
  instrucciones: string | null;
  /** Indica si la operación se hace en modo sandbox (credenciales de prueba). */
  esSandbox: boolean;
  estado: EstadoPagoId;
}

/** Datos para consultar el estado real del pago en la pasarela. */
export interface DatosEstadoPago {
  /** ID externo en la pasarela (mpPaymentId, etc.). */
  externalId: string;
}

/** Resultado normalizado de consultar un pago en la pasarela. */
export interface ResultadoEstadoPago {
  /** Estado tal cual lo reporta la pasarela (approved, rejected, ...). */
  estadoExterno: string;
  montoPago: number | null;
  referencia: string | null;
  externalId: string;
}

/** Estado de la conexión de un proveedor (sin datos sensibles). */
export interface EstadoProveedor {
  conectado: boolean;
  nombreCuenta: string | null;
  actualizadoEn: string | null;
}

/**
 * Pago normalizado que llega desde un webhook, listo para actualizar el
 * registro Payment y el Pedido de forma agnóstica al proveedor.
 */
export interface PagoWebhookNormalizado {
  externalId: string;
  pedidoId: string | null;
  estadoExterno: string;
  montoPago: number | null;
}

/** Resultado de procesar un webhook en un proveedor concreto. */
export interface ResultadoWebhook {
  tipo: "pago" | "ignorar";
  pago?: PagoWebhookNormalizado;
}

/** Definición estática de un método de pago (para la UI y el registro). */
export interface DefinicionMetodoPago {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  /** true si el método requiere conectar una cuenta externa (OAuth). */
  requiereConexion: boolean;
}

/**
 * Contrato que debe cumplir todo proveedor de pagos.
 * El checkout y la configuración dependen de esta interfaz, nunca de un
 * proveedor concreto, para permitir agregar nuevos sin rehacer el checkout.
 */
export interface PaymentProvider {
  id: MetodoPagoId;
  obtenerUrlConexion(tenantId: string): Promise<string>;
  manejarCallback(tenantId: string, codigo: string, codeVerifier: string): Promise<void>;
  desconectar(tenantId: string): Promise<void>;
  obtenerEstado(tenantId: string): Promise<EstadoProveedor>;
  crearPago(datos: DatosCrearPago): Promise<ResultadoCrearPago>;
  obtenerEstadoPago(tenantId: string, datos: DatosEstadoPago): Promise<ResultadoEstadoPago>;
}
