import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { crearHandlerCronExpirarPedidos } from "../src/lib/pedidos/crear-handler-cron-expirar-pedidos";
import type { TenantPublico } from "../src/types/tenants";

function crearTenant(id: string, estado: TenantPublico["estado"]) {
  return { tenant: { id, estado } };
}

function crearRequest(token?: string): NextRequest {
  return new NextRequest("https://interno.example/api/cron/expirar-pedidos", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

async function verificarConfiguracionYAutorizacion(): Promise<void> {
  let consultasRegistro = 0;
  const sinSecreto = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => undefined,
    async listarTenants() {
      consultasRegistro += 1;
      return [];
    },
    async expirarPedidos() { return 0; },
  });
  assert.equal((await sinSecreto(crearRequest("secreto"))).status, 503);
  assert.equal(consultasRegistro, 0, "Sin secreto el endpoint no debe consultar el registro");

  const conSecreto = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => "secreto-cron",
    async listarTenants() {
      consultasRegistro += 1;
      return [];
    },
    async expirarPedidos() { return 0; },
  });
  assert.equal((await conSecreto(crearRequest())).status, 401);
  assert.equal((await conSecreto(crearRequest("secreto-incorrecto"))).status, 401);
  assert.equal(consultasRegistro, 0, "Una credencial inválida no debe consultar el registro");
}

async function verificarAlcancePorTenantYErroresParciales(): Promise<void> {
  const procesados: string[] = [];
  const handler = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => "secreto-cron",
    async listarTenants() {
      return [
        crearTenant("tenant-a", "ACTIVO"),
        crearTenant("tenant-suspendido", "SUSPENDIDO"),
        crearTenant("tenant-b", "ACTIVO"),
      ];
    },
    async expirarPedidos(tenantId) {
      procesados.push(tenantId);
      if (tenantId === "tenant-b") throw new Error("Falla aislada del tenant B");
      return 2;
    },
  });

  const errorOriginal = console.error;
  console.error = () => undefined;
  let respuesta: Response;
  try {
    respuesta = await handler(crearRequest("secreto-cron"));
  } finally {
    console.error = errorOriginal;
  }

  assert.equal(respuesta.status, 207);
  assert.deepEqual(procesados, ["tenant-a", "tenant-b"]);
  assert.deepEqual(await respuesta.json(), {
    tenantsProcesados: 2,
    pedidosExpirados: 2,
    errores: 1,
  });
}

async function verificarRegistroNoDisponible(): Promise<void> {
  const handler = crearHandlerCronExpirarPedidos({
    obtenerSecreto: () => "secreto-cron",
    async listarTenants() { throw new Error("Registro no disponible"); },
    async expirarPedidos() { return 0; },
  });
  assert.equal((await handler(crearRequest("secreto-cron"))).status, 503);
}

async function main(): Promise<void> {
  await verificarConfiguracionYAutorizacion();
  await verificarAlcancePorTenantYErroresParciales();
  await verificarRegistroNoDisponible();
  console.log("Handler cron: secreto, fallo cerrado, tenants activos y errores parciales verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
