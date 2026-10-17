import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { crearHandlerCronExpirarPedidos } from "../src/lib/pedidos/crear-handler-cron-expirar-pedidos";

function crearRequest(token?: string): NextRequest {
  return new NextRequest("https://interno.example/api/cron/expirar-pedidos", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

async function main(): Promise<void> {
  let ejecuciones = 0;
  const sinSecreto = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => undefined,
    async expirarPedidos() { ejecuciones += 1; return 1; },
  });
  assert.equal((await sinSecreto(crearRequest("secreto"))).status, 503);

  const handler = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => "secreto-cron",
    async expirarPedidos() { ejecuciones += 1; return 2; },
  });
  assert.equal((await handler(crearRequest())).status, 401);
  assert.equal((await handler(crearRequest("incorrecto"))).status, 401);
  assert.equal(ejecuciones, 0);

  const respuesta = await handler(crearRequest("secreto-cron"));
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { pedidosExpirados: 2 });
  assert.equal(ejecuciones, 1);

  const conError = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => "secreto-cron",
    async expirarPedidos() { throw new Error("Base no disponible"); },
  });
  assert.equal((await conError(crearRequest("secreto-cron"))).status, 500);
  console.log("Cron: autorización, expiración y error de base verificados.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
