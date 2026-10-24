import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import type { EstadoProveedor } from "@/lib/pagos/tipos";

type CuentaMercadoPagoResumen = {
  conectado: boolean;
  nombreNegocio: string | null;
  updatedAt: Date;
  accessToken: string;
  refreshToken: string | null;
  expiraEn: Date | null;
};

/** Convierte los campos no sensibles de la cuenta en su estado de conexión. */
export function resumirEstadoCuentaMP(
  cuenta: CuentaMercadoPagoResumen | null,
): EstadoProveedor {
  const tokenAccesoDisponible = Boolean(cuenta?.accessToken.trim());
  const tokenRenovable = Boolean(cuenta?.refreshToken?.trim());
  const tokenVencidoSinRenovacion = Boolean(
    cuenta?.expiraEn && cuenta.expiraEn <= new Date() && !tokenRenovable,
  );

  if (!cuenta?.conectado || !tokenAccesoDisponible || tokenVencidoSinRenovacion) {
    return { conectado: false, nombreCuenta: null, actualizadoEn: null };
  }

  const nombreCuenta = cuenta.nombreNegocio?.trim() || null;
  return {
    conectado: true,
    nombreCuenta,
    actualizadoEn: cuenta.updatedAt.toISOString(),
  };
}

/** Lee credenciales solo para comprobar localmente su disponibilidad; no las devuelve,
 * renueva ni contacta Mercado Pago durante una consulta de estado.
 */
export async function obtenerEstadoCuentaMP(tenantId: string): Promise<EstadoProveedor> {
  const cuenta = await conPrismaTenant(tenantId, (prisma) =>
    prisma.cuentaMercadoPago.findUnique({
      where: { clave: "principal" },
      select: {
        conectado: true,
        nombreNegocio: true,
        updatedAt: true,
        accessToken: true,
        refreshToken: true,
        expiraEn: true,
      },
    }),
  );
  return resumirEstadoCuentaMP(cuenta);
}
