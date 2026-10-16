import "server-only";

import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";
import { obtenerProveedorRegistroTenant } from "@/lib/tenants/registry/proveedor-registro";
import type { TenantPublico } from "@/types/tenants";

export async function resolverTenantPorHost(
  host: string,
): Promise<TenantPublico | null> {
  const hostname = normalizarHostname(host);
  if (!hostname) return null;
  const entry = await obtenerProveedorRegistroTenant().resolverPorHostname(hostname);
  return entry?.tenant ?? null;
}
