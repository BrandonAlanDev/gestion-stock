import { redirect } from "next/navigation";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { getOrCreatePageConfig } from "@/actions/page-config/shared/get-page-config";
import { ProveedorConfiguracionPagina } from "@/components/providers/ProveedorConfiguracionPagina";
import ProveedorColoresAdmin from "@/components/providers/ProveedorColoresAdmin";
import { obtenerTenantActual } from "@/lib/tenants/obtener-tenant-actual";
import { requerirAdministradorTenant } from "@/lib/tenants/requerir-administrador-tenant";
import type { ContextoTenant } from "@/types/tenants";
import LayoutComponent from "@/components/layout/LayoutComponent";
import RouteLoader from "@/components/layout/RouteLoader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await obtenerTenantActual();
  if (!tenant) redirect("/404");
  let contexto: ContextoTenant;
  try {
    contexto = await requerirAdministradorTenant();
  } catch {
    redirect("/login");
  }
  if (contexto.tenantId !== tenant.id) redirect("/");

  // Asegura que la configuración del tenant exista.
  await getOrCreatePageConfig(contexto.tenantId);
  const result = await getPageConfig();
  const pageConfig = result?.pageConfig ?? {};

  return (
    <ProveedorConfiguracionPagina pageConfig={{ ok: true, pageConfig }}>
      <LayoutComponent>
        <RouteLoader />
        <ProveedorColoresAdmin>{children}</ProveedorColoresAdmin>
      </LayoutComponent>
    </ProveedorConfiguracionPagina>
  );
}
