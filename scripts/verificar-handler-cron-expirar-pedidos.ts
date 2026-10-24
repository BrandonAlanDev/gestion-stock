import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { crearHandlerCronExpirarPedidos } from "../src/lib/pedidos/crear-handler-cron-expirar-pedidos";

function crearRequest(token?: string): NextRequest {
  return new NextRequest("https://interno.example/api/cron/expirar-pedidos", {
    headers: token ? { authorization: "Bearer " + token } : {},
  });
}

async function main(): Promise<void> {
  let listados = 0;
  let ejecuciones: string[] = [];
  const sinSecreto = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => undefined,
    async listarTenants() { listados += 1; return []; },
    async expirarPedidos() { return 1; },
  });
  assert.equal((await sinSecreto(crearRequest("secreto"))).status, 503);
  assert.equal(listados, 0);

  const handler = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => "secreto-cron",
    async listarTenants() {
      listados += 1;
      return [
        { tenant: { id: "tenant-a", estado: "ACTIVO" } },
        { tenant: { id: "tenant-suspendido", estado: "SUSPENDIDO" } },
        { tenant: { id: "tenant-b", estado: "ACTIVO" } },
      ];
    },
    async expirarPedidos(tenantId) {
      ejecuciones.push(tenantId);
      if (tenantId === "tenant-a") throw new Error("Error simulado de base");
      return 2;
    },
  });
  assert.equal((await handler(crearRequest())).status, 401);
  assert.equal((await handler(crearRequest("incorrecto"))).status, 401);
  assert.equal(ejecuciones.length, 0);

  const respuestaParcial = await handler(crearRequest("secreto-cron"));
  assert.equal(respuestaParcial.status, 207);
  assert.deepEqual(ejecuciones, ["tenant-a", "tenant-b"]);
  assert.deepEqual(await respuestaParcial.json(), {
    tenantsProcesados: 2,
    pedidosExpirados: 2,
    errores: 1,
  });

  ejecuciones = [];
  const handlerCorrecto = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => "secreto-cron",
    async listarTenants() {
      return [{ tenant: { id: "tenant-c", estado: "ACTIVO" } }];
    },
    async expirarPedidos(tenantId) {
      ejecuciones.push(tenantId);
      return 3;
    },
  });
  const respuesta = await handlerCorrecto(crearRequest("secreto-cron"));
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), {
    tenantsProcesados: 1,
    pedidosExpirados: 3,
    errores: 0,
  });
  assert.deepEqual(ejecuciones, ["tenant-c"]);
  console.log("Cron: secreto, tenants activos, aislamiento de errores y resultado verificados con dobles en memoria.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
