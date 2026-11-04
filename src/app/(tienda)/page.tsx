import { getPageConfig } from "@/actions/page-config/general.actions";
import HomeClient from "@/components/home/HomeClient";
import type { ComponentProps } from "react";
import { obtenerCarruselesCacheados } from "@/lib/cache/obtener-carruseles-cacheados";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { obtenerCategoriasCatalogo } from "@/lib/services/categorias/obtener-categorias-catalogo";

export default async function HomePage() {
  const [configuracion, tenant] = await Promise.all([
    getPageConfig(),
    requiereTenantActivo(),
  ]);
  const [carouselsIniciales, categorias] = await Promise.all([
    obtenerCarruselesCacheados(tenant.id),
    obtenerCategoriasCatalogo(tenant.id),
  ]);

  return (
    <HomeClient
      pageConfig={configuracion.pageConfig as unknown as ComponentProps<typeof HomeClient>["pageConfig"]}
      carouselsIniciales={carouselsIniciales as unknown as ComponentProps<typeof HomeClient>["carouselsIniciales"]}
      categorias={categorias}
    />
  );
}
