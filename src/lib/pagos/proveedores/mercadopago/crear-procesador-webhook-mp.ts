import "server-only";

import { WebhookSignatureValidator } from "mercadopago";
import type { NextRequest } from "next/server";
import type { DatosEstadoPago, ResultadoEstadoPago, ResultadoWebhook } from "../../tipos";

export function firmaWebhookMPValida(req: NextRequest, paymentId: string): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("MP_WEBHOOK_SECRET no configurado: se rechazó el webhook.");
    return false;
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

function extraerPaymentId(cuerpo: Record<string, unknown>): string | null {
  const datos = cuerpo.data as Record<string, unknown> | undefined;
  if (datos?.id) return String(datos.id);
  if (cuerpo.topic === "payment" && cuerpo.id) return String(cuerpo.id);
  return null;
}

export interface DependenciasProcesadorWebhookMP {
  validarFirma(request: NextRequest, paymentId: string): boolean;
  obtenerEstadoPago(
    tenantId: string,
    datos: DatosEstadoPago,
  ): Promise<ResultadoEstadoPago>;
}

/** Crea el procesador para verificar la firma antes de consultar el pago. */
export function crearProcesadorWebhookMP(dependencias: DependenciasProcesadorWebhookMP) {
  return async function procesarWebhookMP(
    req: NextRequest,
    tenantId: string,
  ): Promise<ResultadoWebhook> {
    const cuerpo = (await req.json()) as Record<string, unknown>;
    const paymentId = extraerPaymentId(cuerpo);
    if (!paymentId) return { tipo: "ignorar" };

    const idFirmado = req.nextUrl.searchParams.get("data.id");
    if (idFirmado && idFirmado !== paymentId) throw new Error("Firma inválida");
    if (!dependencias.validarFirma(req, paymentId)) throw new Error("Firma inválida");

    const pago = await dependencias.obtenerEstadoPago(tenantId, {
      externalId: paymentId,
    });
    if (pago.externalId !== paymentId) {
      throw new Error("El pago consultado no coincide con la notificación");
    }
    return {
      tipo: "pago",
      pago: {
        externalId: pago.externalId,
        pedidoId: pago.referencia,
        estadoExterno: pago.estadoExterno,
        montoPago: pago.montoPago,
        monedaPago: pago.monedaPago,
        preferenceId: pago.preferenceId,
      },
    };
  };
}
