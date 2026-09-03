import { moduloHabilitado, type ClaveModulo } from "@/lib/modulos/modulo-habilitado";
import { notFound } from "next/navigation";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export async function verificarModuloHabilitado(clave: ClaveModulo): Promise<void> {
  const { id: tenantId } = await requiereTenantActivo();
  if (!(await moduloHabilitado(tenantId, clave))) {
    notFound();
  }
}
