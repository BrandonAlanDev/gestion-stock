import "server-only";

import { headers } from "next/headers";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";

/** Usa el mismo origen que recibió la cookie de estado del comercio. */
export async function obtenerUriRedireccion(): Promise<string> {
  const cabeceras = await headers();
  const hostRecibido = cabeceras.get("x-forwarded-host") ?? cabeceras.get("host") ?? "";
  const hostname = normalizarHostname(hostRecibido);
  if (!hostname || /[,/\\@\s]/.test(hostRecibido)) {
    throw new Error("No se pudo determinar el host de la solicitud OAuth");
  }

  const protocoloRecibido = cabeceras.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocolo = protocoloRecibido ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  if (protocolo !== "http" && protocolo !== "https") {
    throw new Error("Protocolo inválido para la redirección OAuth");
  }
  if (process.env.NODE_ENV === "production" && protocolo !== "https") {
    throw new Error("La redirección OAuth debe usar HTTPS en producción");
  }

  const origen = new URL(`${protocolo}://${hostRecibido}`);
  if (origen.hostname !== hostname && origen.hostname !== `[${hostname}]`) {
    throw new Error("Host inválido para la redirección OAuth");
  }
  const uri = new URL("/api/mercadopago/oauth/callback", origen).toString();

  const configurada = process.env.MP_REDIRECT_URI;
  if (configurada) {
    const urlConfigurada = new URL(configurada);
    const ruta = urlConfigurada.pathname.replace(/\/$/, "");
    if (
      urlConfigurada.origin !== origen.origin ||
      (ruta && ruta !== "/api/mercadopago/oauth/callback") ||
      urlConfigurada.search ||
      urlConfigurada.hash
    ) {
      throw new Error("MP_REDIRECT_URI debe coincidir con el origen del comercio actual");
    }
  }

  return uri;
}
