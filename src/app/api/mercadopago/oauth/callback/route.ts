import { NextRequest, NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerProveedorRegistroTenant } from "@/lib/tenants/registry/proveedor-registro";
import { proveedorMercadoPago } from "@/lib/pagos/proveedores/mercadopago/mercadopago-proveedor";
import { obtenerSecretoFirma } from "@/lib/mercadopago/obtener-secreto-firma";
import {
  crearUrlRelayCallbackOAuth,
  procesarCallbackOAuth,
  validarContextoCallbackOAuth,
} from "@/lib/mercadopago/oauth/procesar-callback";
import {
  esSolicitudCallbackFijo,
  obtenerUriRedireccionFija,
} from "@/lib/mercadopago/uri-redireccion";

function protegerRespuesta(respuesta: NextResponse): NextResponse {
  respuesta.headers.set("Cache-Control", "no-store");
  respuesta.headers.set("Referrer-Policy", "no-referrer");
  return respuesta;
}

function limpiarCookiesOAuth(respuesta: NextResponse): NextResponse {
  const opciones = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  respuesta.cookies.set("mp_oauth_state", "", opciones);
  respuesta.cookies.set("mp_code_verifier", "", opciones);
  return respuesta;
}

function responderCallbackInvalido(
  estado = 400,
  limpiarCookies = false,
): NextResponse {
  const respuesta = protegerRespuesta(NextResponse.json(
    { error: "No se pudo validar el callback OAuth" },
    { status: estado },
  ));
  return limpiarCookies ? limpiarCookiesOAuth(respuesta) : respuesta;
}

function redirigirAlPanel(
  origen: string,
  resultado: { exito: true } | { exito: false; error: string },
): NextResponse {
  const url = new URL("/admin/pageConfig", origen);
  if (resultado.exito) url.searchParams.set("mp_success", "1");
  else url.searchParams.set("mp_error", resultado.error);
  return limpiarCookiesOAuth(protegerRespuesta(NextResponse.redirect(url, 303)));
}

export async function GET(req: NextRequest) {
  let secreto: string;
  let callbackFijo: boolean;
  let uriFija: URL | null;
  try {
    secreto = obtenerSecretoFirma();
    uriFija = obtenerUriRedireccionFija();
    callbackFijo = esSolicitudCallbackFijo(
      req.headers.get("host") ?? "",
      req.nextUrl.pathname,
    );
    if (callbackFijo && !uriFija) return responderCallbackInvalido(503);
  } catch {
    return responderCallbackInvalido(503);
  }

  const estadoFirmado = req.nextUrl.searchParams.get("state") ?? "";
  const codigo = req.nextUrl.searchParams.get("code");
  const errorProveedor = req.nextUrl.searchParams.get("error");
  const obtenerRegistro = () => obtenerProveedorRegistroTenant();

  // Mercado Pago vuelve primero al dominio fijo de la aplicación. Ese dominio
  // solo valida el destino y hace relay; nunca puede canjear ni guardar tokens.
  if (callbackFijo && uriFija) {
    const validacion = await validarContextoCallbackOAuth(estadoFirmado, {
      secreto,
      resolverTenant: async (tenantId) =>
        obtenerRegistro().resolverPorId(tenantId),
      registrarError: (etapa, error) => console.error(
        `Error en la etapa ${etapa} del relay OAuth de Mercado Pago:`,
        error instanceof Error ? error.message : String(error),
      ),
    });
    if (validacion.tipo === "invalido") {
      return responderCallbackInvalido(validacion.status);
    }

    if (validacion.estado.origen !== uriFija.origin) {
      const destino = crearUrlRelayCallbackOAuth(
        estadoFirmado,
        validacion.estado,
        codigo,
        errorProveedor,
      );
      if (!destino) return responderCallbackInvalido(400);
      return protegerRespuesta(NextResponse.redirect(destino, 303));
    }
  }

  let contexto;
  try {
    contexto = await requiereAdmin();
  } catch {
    return responderCallbackInvalido(401, true);
  }

  const resultado = await procesarCallbackOAuth({
    estado: estadoFirmado,
    estadoCookie: req.cookies.get("mp_oauth_state")?.value,
    codeVerifier: req.cookies.get("mp_code_verifier")?.value,
    tenantIdSesion: contexto.tenantId,
    hostRecibido: req.headers.get("host") ?? "",
    codigo,
    errorProveedor,
  }, {
    secreto,
    resolverTenant: (tenantId) => obtenerRegistro().resolverPorId(tenantId),
    manejarCallback: (tenantId, codigoAutorizacion, codeVerifier) =>
      proveedorMercadoPago.manejarCallback(tenantId, codigoAutorizacion, codeVerifier),
    registrarError: (etapa, error) => console.error(
      `Error en la etapa ${etapa} del callback de Mercado Pago:`,
      error instanceof Error ? error.message : String(error),
    ),
  });

  if (resultado.tipo === "invalido") {
    return responderCallbackInvalido(resultado.status, true);
  }
  return redirigirAlPanel(resultado.origen, resultado);
}
