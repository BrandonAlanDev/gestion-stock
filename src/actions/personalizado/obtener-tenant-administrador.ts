import { moduloHabilitado } from "@/lib/modulos/modulo-habilitado";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function obtenerTenantAdministrador() {
  const { tenantId } = await requiereAdmin();
  if (!(await moduloHabilitado(tenantId, "personalizadoEnabled"))) {
    throw new Error("El módulo de tablas personalizadas está desactivado.");
  }
  return tenantId;
}
