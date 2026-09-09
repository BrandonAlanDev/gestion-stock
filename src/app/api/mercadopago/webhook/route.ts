import { NextRequest, NextResponse } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { Payment } from "mercadopago";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { confirmarPedidoPorPago } from "@/lib/pedidos/confirmar-pedido-por-pago";
import { actualizarEstadoPagoPedido } from "@/lib/pedidos/actualizar-estado-pago-pedido";

export const runtime = "nodejs";

function firmaValida(req: NextRequest, paymentId: string): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "MP_WEBHOOK_SECRET no configurado: se rechazó la firma del webhook (fail-closed).",
      );
      return false;
    }
    console.warn("MP_WEBHOOK_SECRET no configurado: no se verificó la firma del webhook.");
    return true;
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: req.nextUrl.searchParams.get("data.id") ?? paymentId,
      secret: secreto,
      toleranceSeconds: 5 * 60,
    });
    return true;
  } catch (error) {
    console.error(
      "Firma inválida en webhook para paymentId:",
      paymentId,
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const paymentId = body?.data?.id || (body?.topic === "payment" ? body?.id : null);
    if (!paymentId) {
      console.log("Webhook MP sin paymentId. Tipo:", body?.type || body?.topic);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) {
      console.error("Webhook MP sin tenantId para paymentId:", paymentId);
      return NextResponse.json({ error: "sinTenant" }, { status: 200 });
    }

    if (!firmaValida(req, String(paymentId))) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const mp = await obtenerClienteMP(tenantId);
    const payment = new Payment(mp);
    const datosPago = await payment.get({ id: paymentId });

    const pedidoId = datosPago.external_reference;
    if (!pedidoId) {
      console.error("Pago sin external_reference (pedidoId). paymentId:", paymentId);
      return NextResponse.json({ error: "Sin pedidoId" }, { status: 200 });
    }

    switch (datosPago.status) {
      case "approved": {
        const montoAcreditado = Number(datosPago.transaction_amount ?? 0);
        const resultado = await confirmarPedidoPorPago({
          pedidoId,
          tenantId,
          estadoPago: "approved",
          referencia: String(datosPago.external_reference ?? ""),
          montoPago: montoAcreditado,
          paymentId: String(datosPago.id),
        });

        if (resultado.ok && !resultado.yaConfirmado) {
          console.log(`Pedido ${pedidoId} CONFIRMADO por pago ${datosPago.id}`);
        } else if (resultado.ok && resultado.yaConfirmado) {
          console.log(`Pedido ${pedidoId} ya confirmado (pago ${datosPago.id}).`);
        } else {
          console.error(`No se pudo confirmar el pedido ${pedidoId}: ${resultado.error}`);
        }
        break;
      }

      case "pending":
      case "in_process": {
        await actualizarEstadoPagoPedido(pedidoId, tenantId, {
          estadoPago: "EN_ACREDITACION",
          paymentId: String(datosPago.id),
        });
        console.log(`Pago ${datosPago.id} en acreditación para pedido ${pedidoId}`);
        break;
      }

      case "rejected": {
        await actualizarEstadoPagoPedido(pedidoId, tenantId, {
          estadoPago: "RECHAZADO",
          paymentId: String(datosPago.id),
        });
        console.log(`Pago rechazado para pedido ${pedidoId}`);
        break;
      }

      case "cancelled": {
        await actualizarEstadoPagoPedido(pedidoId, tenantId, {
          estadoPago: "CANCELADO",
          paymentId: String(datosPago.id),
          cancelar: true,
        });
        console.log(`Pago cancelado para pedido ${pedidoId}`);
        break;
      }

      case "refunded":
      case "charged_back": {
        await actualizarEstadoPagoPedido(pedidoId, tenantId, {
          estadoPago: "CANCELADO",
          paymentId: String(datosPago.id),
          cancelar: true,
        });
        console.log(`Devolución/contracargo para pedido ${pedidoId}`);
        break;
      }

      default:
        console.log(`Estado de pago no manejado: ${datosPago.status}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(
      "Error en webhook MP:",
      error instanceof Error ? error.message : String(error),
    );
    // Devolvemos 200 para que Mercado Pago no reintente indefinidamente.
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "MP Webhook activo" }, { status: 200 });
}
