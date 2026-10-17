import "server-only";

import { headers } from "next/headers";
import { resolverHostnameTenant } from "@/lib/tenants/resolver-hostname-tenant";

export async function obtenerHostnameSolicitud(): Promise<string | null> {
  const cabeceras = await headers();
  // Host es la autoridad de la solicitud; en desarrollo local puede usarse
  // el dominio fijo configurado en el servidor para probar otro cliente.
  // No se toma x-forwarded-host porque el cliente podría controlarlo.
  const host = cabeceras.get("host") ?? "";
  return resolverHostnameTenant(host);
}
