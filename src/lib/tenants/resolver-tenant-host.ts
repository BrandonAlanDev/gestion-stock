import "server-only";

import { resolverHostnameTenant } from "@/lib/tenants/resolver-hostname-tenant";
import { obtenerProveedorRegistroTenant } from "@/lib/tenants/registry/proveedor-registro";
import type { TenantPublico } from "@/types/tenants";

export async function resolverTenantPorHost(
  host: string,
): Promise<TenantPublico | null> {
  const hostname = resolverHostnameTenant(host);
  if (!hostname) return null;
  const entry = await obtenerProveedorRegistroTenant().resolverPorHostname(hostname);
  return entry?.tenant ?? null;
}
