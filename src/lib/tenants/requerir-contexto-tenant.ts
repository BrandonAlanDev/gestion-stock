import "server-only";

import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import type { ContextoTenant } from "@/types/tenants";

export async function requerirContextoTenant(): Promise<ContextoTenant> {
  const contexto = await obtenerContextoTenant();
  if (!contexto) throw new Error("No autorizado");
  return contexto;
}
