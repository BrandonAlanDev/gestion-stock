import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { crearHandlerWebhookMP } from "../src/lib/pagos/proveedores/mercadopago/crear-handler-webhook-mp";
import type { PagoWebhookNormalizado } from "../src/lib/pagos/tipos";
import type { TenantPublico } from "../src/types/tenants";

const TENANT_A: TenantPublico = {
  id: "tenant-a",
  nombre: "Tienda A",
  slug: "tienda-a",
  dominio: "a.example.com",
  estado: "ACTIVO",
};

const PAGO: PagoWebhookNormalizado = {
  externalId: "mp-123",
  pedidoId: "pedido-a",
  estadoExterno: "approved",
  montoPago: 2500,
  monedaPago: "ARS",
};

function crearRequest(host: string, tenantId: string): NextRequest {
  return new NextRequest(
    `https://a.example.com/api/mercadopago/webhook?tenantId=${encodeURIComponent(tenantId)}`,
    { method: "POST", headers: { host }, body: "{}" },
  );
}

async function verificarTenantYConsulta(): Promise<void> {
  const llamadas: string[] = [];
  const handler = crearHandlerWebhookMP({
    async resolverTenant(hostname) {
      llamadas.push(`resolver:${hostname}`);
      return hostname === TENANT_A.dominio ? TENANT_A : null;
    },
    async procesarWebhook(_request, tenantId) {
      llamadas.push(`procesar:${tenantId}`);
      return { tipo: "pago", pago: PAGO };
    },
    async aplicarPago(tenantId, pago) {
      llamadas.push(`aplicar:${tenantId}:${pago.externalId}`);
    },
  });

  const respuesta = await handler(crearRequest("a.example.com", TENANT_A.id));
  assert.equal(respuesta.status, 200);
  assert.deepEqual(llamadas, [
    "resolver:a.example.com",
    "procesar:tenant-a",
    "aplicar:tenant-a:mp-123",
  ]);

  llamadas.length = 0;
  const discrepancia = await handler(crearRequest("a.example.com", "tenant-b"));
  assert.equal(discrepancia.status, 401);
  assert.deepEqual(llamadas, ["resolver:a.example.com"], "Un ID distinto no debe llegar al proveedor de pagos");
}

async function verificarHostDesconocidoYSuspendido(): Promise<void> {
  let llamadasProcesar = 0;
  const handler = crearHandlerWebhookMP({
    async resolverTenant(hostname) {
      if (hostname === "suspendido.example.com") return { ...TENANT_A, estado: "SUSPENDIDO" };
      return null;
    },
    async procesarWebhook() {
      llamadasProcesar += 1;
      return { tipo: "ignorar" };
    },
    async aplicarPago() {},
  });

  assert.equal((await handler(crearRequest("desconocido.example.com", TENANT_A.id))).status, 404);
  assert.equal((await handler(crearRequest("suspendido.example.com", TENANT_A.id))).status, 404);
  assert.equal(llamadasProcesar, 0);
}

async function verificarHostAmbiguoYFirmaInvalida(): Promise<void> {
  let llamadasResolver = 0;
  const handler = crearHandlerWebhookMP({
    async resolverTenant() {
      llamadasResolver += 1;
      return TENANT_A;
    },
    async procesarWebhook() {
      throw new Error("Firma inválida");
    },
    async aplicarPago() {},
  });

  assert.equal((await handler(crearRequest("a.example.com, b.example.com", TENANT_A.id))).status, 404);
  assert.equal(llamadasResolver, 0, "Un Host ambiguo no debe consultar el registro");
  assert.equal((await handler(crearRequest("a.example.com", TENANT_A.id))).status, 401);
}

async function main(): Promise<void> {
  await verificarTenantYConsulta();
  await verificarHostDesconocidoYSuspendido();
  await verificarHostAmbiguoYFirmaInvalida();
  console.log("Route Handler MP: host, tenant, firma y despacho del pago verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
