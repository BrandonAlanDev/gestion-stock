import { getPageConfig } from "@/actions/page-config/general.actions";
import HomeClient from "@/components/home/HomeClient";
import type { ComponentProps } from "react";
import { obtenerCarruselesCacheados } from "@/lib/cache/obtener-carruseles-cacheados";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export default async function HomePage() {
  const [configuracion, tenant] = await Promise.all([
    getPageConfig(),
    requiereTenantActivo(),
  ]);
  const carouselsIniciales = await obtenerCarruselesCacheados(tenant.id);

  return (
    <HomeClient
      pageConfig={configuracion.pageConfig as unknown as ComponentProps<typeof HomeClient>["pageConfig"]}
      carouselsIniciales={carouselsIniciales as unknown as ComponentProps<typeof HomeClient>["carouselsIniciales"]}
    />
  );
}
