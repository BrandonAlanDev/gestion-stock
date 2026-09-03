import "server-only";

import { cache } from "react";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";

export const obtenerConfiguracionPaginaSolicitud = cache(async () => {
  const tenant = await obtenerTenantPublico();

  if (!tenant || tenant.estado !== "ACTIVO") {
    return { ok: false as const, pageConfig: null };
  }

  return getPageConfig();
});
