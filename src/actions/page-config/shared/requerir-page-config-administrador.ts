import "server-only";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { getOrCreatePageConfig } from "@/actions/page-config/shared/get-page-config";

export async function requerirPageConfigAdministrador() {
  const contexto = await requiereAdmin();
  const pageConfig = await getOrCreatePageConfig(contexto.tenantId);
  return { contexto, pageConfig };
}
