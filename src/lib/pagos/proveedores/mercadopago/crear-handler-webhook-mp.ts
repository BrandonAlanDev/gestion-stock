import { NextResponse, type NextRequest } from "next/server";
import type { PagoWebhookNormalizado, ResultadoWebhook } from "@/lib/pagos/tipos";

export interface DependenciasHandlerWebhookMP {
  procesarWebhook(request: NextRequest): Promise<ResultadoWebhook>;
  aplicarPago(pago: PagoWebhookNormalizado): Promise<void>;
}

/** Recibe una notificación firmada y aplica el pago al pedido indicado. */
export function crearHandlerWebhookMP(dependencias: DependenciasHandlerWebhookMP) {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    try {
      const resultado = await dependencias.procesarWebhook(request);
      if (resultado.tipo === "pago" && resultado.pago?.pedidoId) {
        await dependencias.aplicarPago(resultado.pago);
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
