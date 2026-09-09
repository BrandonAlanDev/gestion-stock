import { NextRequest, NextResponse } from "next/server";
import { aplicarWebhookPago } from "@/lib/pagos/aplicar-webhook-pago";
import { procesarWebhookMP } from "@/lib/pagos/proveedores/mercadopago/mercadopago-proveedor";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const resultado = await procesarWebhookMP(req);

    if (resultado.tipo === "pago" && resultado.pago?.pedidoId) {
      const tenantId = req.nextUrl.searchParams.get("tenantId");
      console.log(
        `Webhook: pago ${resultado.pago.externalId} estado ${resultado.pago.estadoExterno} pedido ${resultado.pago.pedidoId}`,
      );
      await aplicarWebhookPago(tenantId, resultado.pago);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error("Error en webhook MP:", mensaje);
    if (mensaje === "Firma inválida") {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
    // Devolvemos 200 para que Mercado Pago no reintente indefinidamente.
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "MP Webhook activo" }, { status: 200 });
}
