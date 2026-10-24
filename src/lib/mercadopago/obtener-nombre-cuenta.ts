import "server-only";

import { obtenerEstadoCuentaMP } from "./obtener-estado-cuenta";

/** Lee el nombre guardado de la cuenta sin renovar credenciales ni consultar la API. */
export async function obtenerNombreCuentaMP(tenantId: string): Promise<string | null> {
  return (await obtenerEstadoCuentaMP(tenantId)).nombreCuenta;
}
