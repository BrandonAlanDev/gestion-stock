"use server";

import { obtenerCategoriasCatalogo } from "@/lib/services/categorias/obtener-categorias-catalogo";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export async function obtenerCategoriasCatalogoPublicas() {
  const tenant = await requiereTenantActivo();
  return obtenerCategoriasCatalogo(tenant.id);
}
