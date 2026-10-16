import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";

const contextoTenantRuntime = new AsyncLocalStorage<string>();

export function obtenerTenantIdRuntime(): string | undefined {
  return contextoTenantRuntime.getStore();
}

export function conContextoTenantRuntime<T>(
  tenantId: string,
  operacion: () => Promise<T>,
): Promise<T> {
  if (!tenantId.trim()) throw new Error("Se requiere el tenant del servidor");
  return contextoTenantRuntime.run(tenantId, operacion);
}
