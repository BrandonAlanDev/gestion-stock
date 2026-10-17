import "server-only";

import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import { obtenerHostnameSolicitud } from "@/lib/tenants/obtener-hostname-solicitud";
import { obtenerProveedorRegistroTenant } from "@/lib/tenants/registry/proveedor-registro";
import type { TenantPublico } from "@/types/tenants";

export async function requiereTenantActivo(): Promise<TenantPublico> {
  const tenant = await obtenerTenantPublico();
  if (!tenant) throw new Error("Sitio no configurado");
  if (tenant.estado === "SUSPENDIDO") throw new Error("Sitio suspendido");
  if (tenant.estado !== "ACTIVO") throw new Error("Sitio no disponible");
  const hostname = await obtenerHostnameSolicitud();
  const registro = obtenerProveedorRegistroTenant();
  const entrada = hostname ? await registro.resolverPorHostname(hostname) : null;
  if (!entrada || entrada.tenant.id !== tenant.id) throw new Error("Sitio no disponible");
  const versionVigente = await registro.verificarAcceso(tenant.id);
  if (versionVigente !== undefined && versionVigente !== entrada.versionCache) {
    registro.invalidar();
    throw new Error("La configuración de la tienda cambió; reintentá la solicitud");
  }
  return tenant;
}
