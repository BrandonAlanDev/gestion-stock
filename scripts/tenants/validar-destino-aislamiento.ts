import type { CredencialesBaseTenant } from "../../src/lib/tenants/registry/types";

export function validarDestinoLocalDescartable(
  tenantId: string,
  credenciales: CredencialesBaseTenant,
): void {
  const host = credenciales.host.toLowerCase().replace(/^\[|\]$/g, "");
  if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
    throw new Error(`El tenant ${tenantId} no apunta a un host local descartable`);
  }
  if (!/^[a-z0-9][a-z0-9_-]*_test$/i.test(credenciales.base)) {
    throw new Error(`La base del tenant ${tenantId} debe terminar en _test`);
  }
}

export function confirmarDestinoAislamiento(
  tenantId: string,
  credenciales: CredencialesBaseTenant,
  confirmacion: string | undefined,
): void {
  const destino = `${tenantId}|${credenciales.host}:${credenciales.puerto}/${credenciales.base}`;
  if (confirmacion !== destino) {
    throw new Error(
      `TENANT_ISOLATION_TEST_CONFIRM_TARGET debe coincidir exactamente con: ${destino}`,
    );
  }
}
