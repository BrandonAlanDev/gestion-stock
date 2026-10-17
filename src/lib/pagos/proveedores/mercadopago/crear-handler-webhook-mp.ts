import { NextResponse, type NextRequest } from "next/server";
import type { PagoWebhookNormalizado, ResultadoWebhook } from "@/lib/pagos/tipos";
import type { TenantPublico } from "@/types/tenants";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";

export interface DependenciasHandlerWebhookMP {
  resolverTenant(hostname: string): Promise<TenantPublico | null>;
  procesarWebhook(request: NextRequest, tenantId: string): Promise<ResultadoWebhook>;
  aplicarPago(tenantId: string, pago: PagoWebhookNormalizado): Promise<void>;
}

/** Recibe una notificación firmada y aplica el pago al pedido indicado. */
export function crearHandlerWebhookMP(dependencias: DependenciasHandlerWebhookMP) {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    try {
      const hostname = normalizarHostname(request.headers.get("host") ?? "");
      const tenant = hostname ? await dependencias.resolverTenant(hostname) : null;
      if (!tenant || tenant.estado !== "ACTIVO") {
        return NextResponse.json({ error: "Organización no disponible" }, { status: 404 });
      }
      const tenantIdIndicado = request.nextUrl.searchParams.get("tenantId");
      if (!tenantIdIndicado || tenantIdIndicado !== tenant.id) {
        return NextResponse.json({ error: "Notificación inválida" }, { status: 401 });
      }
      const resultado = await dependencias.procesarWebhook(request, tenant.id);
      if (resultado.tipo === "pago" && resultado.pago?.pedidoId) {
        await dependencias.aplicarPago(tenant.id, resultado.pago);
      }
      return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      console.error("Error en webhook MP:", mensaje);
      if (mensaje === "Firma inválida") {
        return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
      }
      return NextResponse.json({ error: "No se pudo procesar el pago" }, { status: 500 });
    }
  };
}
