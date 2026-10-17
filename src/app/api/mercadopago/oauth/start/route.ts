import { NextRequest, NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { construirUrlAutorizacionMP } from "@/lib/mercadopago/url-autorizacion";
import { obtenerSecretoFirma } from "@/lib/mercadopago/obtener-secreto-firma";
import { construirOrigenSolicitud } from "@/lib/tenants/construir-origen-solicitud";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";
import {
  firmarEstadoOAuth,
  generarDesafioPKCE,
  generarVerificadorPKCE,
} from "@/lib/mercadopago/oauth/seguridad-oauth";

type CodigoErrorInicio =
  | "no_autorizado"
  | "sin_client_id"
  | "configuracion_incompleta"
  | "inicio_fallido";

function redirigirConError(urlBase: URL, codigo: CodigoErrorInicio): NextResponse {
  urlBase.searchParams.set("mp_error", codigo);
  return NextResponse.redirect(urlBase, 303);
}

export async function POST(req: NextRequest) {
  const urlAdmin = new URL("/admin/pageConfig", req.url);

  const hostRecibido = req.headers.get("host") ?? "";
  const hostname = normalizarHostname(hostRecibido);
  const origen = construirOrigenSolicitud(
    hostRecibido,
    process.env.NODE_ENV === "production",
  );
  const origenHeader = req.headers.get("origin");
  if (!hostname || !origen || !origenHeader || origenHeader !== origen) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  try {
    await requiereAdmin();
  } catch {
    return redirigirConError(urlAdmin, "no_autorizado");
  }

  if (!process.env.MP_CLIENT_ID) {
    console.error("MP_CLIENT_ID no configurado en el .env");
    return redirigirConError(urlAdmin, "sin_client_id");
  }

  if (!process.env.MP_CLIENT_SECRET) {
    console.error("MP_CLIENT_SECRET no configurado en el .env");
    return redirigirConError(urlAdmin, "configuracion_incompleta");
  }
  if (!process.env.AUTH_SECRET) {
    console.error("AUTH_SECRET no configurado en el .env");
    return redirigirConError(urlAdmin, "configuracion_incompleta");
  }

  try {
    const codeVerifier = generarVerificadorPKCE();
    const estado = firmarEstadoOAuth(
      hostname,
      origen,
      obtenerSecretoFirma(),
    );
    const codeChallenge = generarDesafioPKCE(codeVerifier);

    const urlAutorizacion = await construirUrlAutorizacionMP(estado, codeChallenge);

    const respuesta = NextResponse.redirect(urlAutorizacion, 303);
    respuesta.headers.set("Cache-Control", "no-store");
    respuesta.headers.set("Referrer-Policy", "no-referrer");
    const opcionesCookie = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 10 * 60,
    };
    respuesta.cookies.set("mp_oauth_state", estado, opcionesCookie);
    respuesta.cookies.set("mp_code_verifier", codeVerifier, opcionesCookie);
    return respuesta;
  } catch (error) {
    console.error("Error al iniciar conexión con Mercado Pago:", error);
    return redirigirConError(urlAdmin, "inicio_fallido");
  }
}
