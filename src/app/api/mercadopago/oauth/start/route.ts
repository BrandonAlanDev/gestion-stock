import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes, createHmac } from "crypto";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { construirUrlAutorizacionMP } from "@/lib/mercadopago/url-autorizacion";

type CodigoErrorInicio =
  | "no_autorizado"
  | "sin_client_id"
  | "configuracion_incompleta"
  | "inicio_fallido";

function redirigirConError(urlBase: URL, codigo: CodigoErrorInicio): NextResponse {
  urlBase.searchParams.set("mp_error", codigo);
  return NextResponse.redirect(urlBase);
}

/** Secreto para firmar el state del OAuth: AUTH_SECRET, con un fallback por tenant. */
function obtenerSecretoFirma(tenantId: string): string {
  return process.env.AUTH_SECRET || `gestion-stock-oauth-v1:${tenantId}:sal-fija`;
}

/** Firma el state con HMAC-SHA256 para ligarlo al administrador del comercio. */
function firmarState(estado: string, tenantId: string): string {
  return createHmac("sha256", obtenerSecretoFirma(tenantId))
    .update(estado)
    .digest("base64url");
}

function generarCodeVerifier(): string {
  // 64 bytes -> 86 caracteres en base64url, dentro del rango 43-128.
  return randomBytes(64).toString("base64url").replace(/=+$/, "");
}

async function generarCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("base64url").replace(/=+$/, "");
}

export async function GET(req: NextRequest) {
  const urlAdmin = new URL("/admin/pageConfig", req.url);

  let contexto;
  try {
    contexto = await requiereAdmin();
  } catch {
    return redirigirConError(urlAdmin, "no_autorizado");
  }

  if (!contexto) return redirigirConError(urlAdmin, "no_autorizado");

  if (!process.env.MP_CLIENT_ID) {
    console.error("MP_CLIENT_ID no configurado en el .env");
    return redirigirConError(urlAdmin, "sin_client_id");
  }

  if (!process.env.MP_CLIENT_SECRET) {
    console.error("MP_CLIENT_SECRET no configurado en el .env");
    return redirigirConError(urlAdmin, "configuracion_incompleta");
  }

  try {
    const uuidEstado = randomUUID();
    const estado = `${uuidEstado}.${firmarState(uuidEstado, contexto.tenantId)}`;
    const codeVerifier = generarCodeVerifier();
    const codeChallenge = await generarCodeChallenge(codeVerifier);

    const urlAutorizacion = await construirUrlAutorizacionMP(estado, codeChallenge);

    const respuesta = NextResponse.redirect(urlAutorizacion);

    respuesta.cookies.set("mp_oauth_state", estado, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    respuesta.cookies.set("mp_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return respuesta;
  } catch (error) {
    console.error("Error al iniciar conexión con Mercado Pago:", error);
    return redirigirConError(urlAdmin, "inicio_fallido");
  }
}
