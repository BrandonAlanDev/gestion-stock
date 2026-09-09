import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { proveedorMercadoPago } from "@/lib/pagos/proveedores/mercadopago/mercadopago-proveedor";

/** Secreto para verificar la firma del state. Debe ser idéntico al usado en start. */
function obtenerSecretoFirma(tenantId: string): string {
  return process.env.AUTH_SECRET || `gestion-stock-oauth-v1:${tenantId}:sal-fija`;
}

/** Separa `<uuid>.<firma>`, recalcula el HMAC-SHA256 y compara en tiempo constante. */
function verificarFirma(estadoFirmado: string, tenantId: string): boolean {
  try {
    const ultimoPunto = estadoFirmado.lastIndexOf(".");
    if (ultimoPunto <= 0 || ultimoPunto === estadoFirmado.length - 1) return false;

    const uuid = estadoFirmado.slice(0, ultimoPunto);
    const firmaRecibida = Buffer.from(estadoFirmado.slice(ultimoPunto + 1), "base64url");
    const firmaEsperada = createHmac("sha256", obtenerSecretoFirma(tenantId))
      .update(uuid)
      .digest();

    if (firmaRecibida.length !== firmaEsperada.length) return false;
    return timingSafeEqual(firmaEsperada, firmaRecibida);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL("/admin/pageConfig", req.url);

  let contexto;
  try {
    contexto = await requiereAdmin();
  } catch {
    url.searchParams.set("mp_error", "no_autorizado");
    return NextResponse.redirect(url);
  }

  if (!contexto) {
    url.searchParams.set("mp_error", "no_autorizado");
    return NextResponse.redirect(url);
  }

  try {
    const codigo = req.nextUrl.searchParams.get("code");
    const estadoRecibido = req.nextUrl.searchParams.get("state");
    const estadoGuardado = req.cookies.get("mp_oauth_state")?.value;
    const codeVerifier = req.cookies.get("mp_code_verifier")?.value;

    if (!codigo) {
      url.searchParams.set("mp_error", "sin_codigo");
      return NextResponse.redirect(url);
    }

    if (!estadoRecibido || !estadoGuardado || estadoGuardado !== estadoRecibido) {
      url.searchParams.set("mp_error", "estado_invalido");
      return NextResponse.redirect(url);
    }

    if (!verificarFirma(estadoRecibido, contexto.tenantId)) {
      url.searchParams.set("mp_error", "estado_invalido");
      return NextResponse.redirect(url);
    }

    if (!codeVerifier) {
      url.searchParams.set("mp_error", "configuracion_incompleta");
      return NextResponse.redirect(url);
    }

    await proveedorMercadoPago.manejarCallback(
      contexto.tenantId,
      codigo,
      codeVerifier,
    );

    url.searchParams.set("mp_success", "1");
    const respuesta = NextResponse.redirect(url);
    respuesta.cookies.delete("mp_oauth_state");
    respuesta.cookies.delete("mp_code_verifier");
    return respuesta;
  } catch (error) {
    console.error(
      "Error en callback de Mercado Pago:",
      error instanceof Error ? error.message : String(error),
    );
    url.searchParams.set("mp_error", "conexion_fallida");
    return NextResponse.redirect(url);
  }
}
