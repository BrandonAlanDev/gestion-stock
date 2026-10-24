"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerEstadoCuentaMP } from "@/lib/mercadopago/obtener-estado-cuenta";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import type { EstadoConexionMP } from "@/types/mercadopago";

/** Devuelve el estado de conexión de Mercado Pago del comercio, sin exponer tokens. */
export async function obtenerEstadoConexionMP(): Promise<EstadoConexionMP> {
  let fase: "autenticacion" | "lectura_tenant" = "autenticacion";
  try {
    const contexto = await requiereAdmin();
    fase = "lectura_tenant";
    const estado = await obtenerEstadoCuentaMP(contexto.tenantId);
    return {
      conectada: estado.conectado,
      nombreCuenta: estado.nombreCuenta,
      actualizadaEn: estado.actualizadoEn,
    };
  } catch (error) {
    registrarErrorPagoSeguro("Error consultando estado de Mercado Pago", error, undefined, fase);
    throw error;
  }
}
