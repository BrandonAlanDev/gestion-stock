import "server-only";

import { headers } from "next/headers";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";

export async function obtenerHostnameSolicitud(): Promise<string | null> {
  const cabeceras = await headers();
  const host =
    cabeceras.get("x-forwarded-host") ?? cabeceras.get("host") ?? "";
  return normalizarHostname(host);
}
