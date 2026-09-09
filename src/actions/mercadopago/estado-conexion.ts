"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerCuentaMP } from "@/lib/mercadopago/obtener-cuenta";
import { obtenerNombreCuentaMP } from "@/lib/mercadopago/obtener-nombre-cuenta";
import type { EstadoConexionMP } from "@/types/mercadopago";

/** Devuelve el estado de conexión de Mercado Pago del comercio, sin exponer tokens. */
export async function obtenerEstadoConexionMP(): Promise<EstadoConexionMP> {
  try {
    const contexto = await requiereAdmin();
    const cuenta = await obtenerCuentaMP(contexto.tenantId);

    if (!cuenta?.conectado) {
      return { conectada: false, nombreCuenta: null, actualizadaEn: null };
    }

    const nombreCuenta = await obtenerNombreCuentaMP(contexto.tenantId);

    return {
      conectada: true,
      nombreCuenta,
      actualizadaEn: cuenta.updatedAt.toISOString(),
    };
  } catch {
    return { conectada: false, nombreCuenta: null, actualizadaEn: null };
  }
}
