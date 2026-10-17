import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import {
  crearProcesadorWebhookMP,
  firmaWebhookMPValida,
} from "../src/lib/pagos/proveedores/mercadopago/crear-procesador-webhook-mp";

const SECRETO = "secreto-de-prueba-del-webhook";
const PAYMENT_ID = "mp-123";
const REQUEST_ID = "request-verificacion-1";

function firmar(paymentId: string): { timestamp: string; firma: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const manifiesto = `id:${paymentId};request-id:${REQUEST_ID};ts:${timestamp};`;
  const hash = createHmac("sha256", SECRETO).update(manifiesto).digest("hex");
  return { timestamp, firma: `ts=${timestamp},v1=${hash}` };
}

function crearRequest(
  cuerpo: unknown,
  opciones: { dataId?: string; firma?: string } = {},
): NextRequest {
  const query = opciones.dataId === undefined
    ? ""
    : `?data.id=${encodeURIComponent(opciones.dataId)}`;
  return new NextRequest(`https://a.example.com/api/mercadopago/webhook${query}`, {
    method: "POST",
    headers: {
      "x-request-id": REQUEST_ID,
      ...(opciones.firma ? { "x-signature": opciones.firma } : {}),
    },
    body: JSON.stringify(cuerpo),
  });
}

async function main(): Promise<void> {
  const secretoAnterior = process.env.MP_WEBHOOK_SECRET;
  process.env.MP_WEBHOOK_SECRET = SECRETO;

  try {
    const llamadasProveedor: string[] = [];
    const procesar = crearProcesadorWebhookMP({
      validarFirma: firmaWebhookMPValida,
      async obtenerEstadoPago(datos) {
        llamadasProveedor.push(datos.externalId);
        return {
          externalId: datos.externalId,
          referencia: "pedido-a",
          estadoExterno: "approved",
          montoPago: 2500,
          monedaPago: "ARS",
        };
      },
    });

    const firmaValida = firmar(PAYMENT_ID);
    const resultado = await procesar(
      crearRequest({ type: "payment", data: { id: PAYMENT_ID } }, {
        dataId: PAYMENT_ID,
        firma: firmaValida.firma,
      }),
    );
    assert.deepEqual(resultado, {
      tipo: "pago",
      pago: {
        externalId: PAYMENT_ID,
        pedidoId: "pedido-a",
        estadoExterno: "approved",
        montoPago: 2500,
        monedaPago: "ARS",
      },
    });
    assert.deepEqual(llamadasProveedor, [PAYMENT_ID]);

    const llamadasAntesFirmaInvalida = llamadasProveedor.length;
    const ultimoDigito = firmaValida.firma.at(-1);
    const firmaAlterada = `${firmaValida.firma.slice(0, -1)}${ultimoDigito === "0" ? "1" : "0"}`;
    await assert.rejects(
      procesar(
        crearRequest({ type: "payment", data: { id: PAYMENT_ID } }, {
          dataId: PAYMENT_ID,
          firma: firmaAlterada,
        }),
      ),
      /Firma inválida/,
    );
    assert.equal(llamadasProveedor.length, llamadasAntesFirmaInvalida);

    const firmaDeOtroPago = firmar("mp-otro");
    await assert.rejects(
      procesar(
        crearRequest({ type: "payment", data: { id: PAYMENT_ID } }, {
          dataId: "mp-otro",
          firma: firmaDeOtroPago.firma,
        }),
      ),
      /Firma inválida/,
    );
    assert.equal(llamadasProveedor.length, llamadasAntesFirmaInvalida);

    const ignorar = await procesar(crearRequest({ type: "merchant_order", data: {} }));
    assert.deepEqual(ignorar, { tipo: "ignorar" });
    assert.equal(llamadasProveedor.length, llamadasAntesFirmaInvalida);

    console.log("Webhook MP: HMAC del SDK, coherencia de data.id y consulta del pago verificados.");
  } finally {
    if (secretoAnterior === undefined) delete process.env.MP_WEBHOOK_SECRET;
    else process.env.MP_WEBHOOK_SECRET = secretoAnterior;
  }
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
