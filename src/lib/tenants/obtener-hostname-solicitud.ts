import "server-only";

import { headers } from "next/headers";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";

export async function obtenerHostnameSolicitud(): Promise<string | null> {
  const cabeceras = await headers();
  // Host es la cabecera que recibe la solicitud. No se toma x-forwarded-host
  // como autoridad porque puede ser controlada por el cliente si el proxy no
  // la sobrescribe de forma confiable.
  const host = cabeceras.get("host") ?? "";
  return normalizarHostname(host);
}
