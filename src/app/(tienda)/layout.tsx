import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import AppGate from "@/components/layout/AppGate";
import LayoutComponent from "@/components/layout/LayoutComponent";
import RouteLoader from "@/components/layout/RouteLoader";
import PantallaMantenimiento from "@/components/mantenimiento/PantallaMantenimiento";
import { SitioSuspendido } from "@/components/tenants/sitio-suspendido";
import { obtenerConfiguracionPaginaSolicitud } from "@/lib/configuracion-pagina/obtener-configuracion-pagina-solicitud";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";

export default async function LayoutTienda({ children }: { children: ReactNode }) {
  const tenant = await obtenerTenantPublico();

  if (!tenant || tenant.estado === "INACTIVO") {
    notFound();
  }

  if (tenant.estado === "SUSPENDIDO") {
    return <SitioSuspendido nombre={tenant.nombre} />;
  }

  const { pageConfig } = await obtenerConfiguracionPaginaSolicitud();

  if (pageConfig?.maintenanceMode) {
    return (
      <PantallaMantenimiento
        storeName={pageConfig.storeName ?? tenant.nombre}
        logo={pageConfig.logo ?? null}
      />
    );
  }

  return (
    <LayoutComponent>
      <AppGate>
        <RouteLoader />
        {children}
      </AppGate>
    </LayoutComponent>
  );
}
