import "server-only";

import { cache } from "react";
import { obtenerHostnameSolicitud } from "@/lib/tenants/obtener-hostname-solicitud";
import { resolverTenantPorHost } from "@/lib/tenants/resolver-tenant-host";
import type { TenantPublico } from "@/types/tenants";

const obtenerTenantPublicoMemoizado = cache(
  async (): Promise<TenantPublico | null> => {
    const hostname = await obtenerHostnameSolicitud();
    if (!hostname) return null;
    return resolverTenantPorHost(hostname);
  },
);

export async function obtenerTenantPublico(): Promise<TenantPublico | null> {
  return obtenerTenantPublicoMemoizado();
}
