import { redirect } from "next/navigation";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { getOrCreatePageConfig } from "@/actions/page-config/shared/get-page-config";
import { ProveedorConfiguracionPagina } from "@/components/providers/ProveedorConfiguracionPagina";
import ProveedorTemaAdmin from "@/components/admin/tema/ProveedorTemaAdmin";
import { requerirAdministradorTenant } from "@/lib/tenants/requerir-administrador-tenant";
import type { ContextoTenant } from "@/types/tenants";
import LayoutComponent from "@/components/layout/LayoutComponent";
import RouteLoader from "@/components/layout/RouteLoader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let contexto: ContextoTenant;
  try {
    contexto = await requerirAdministradorTenant();
  } catch {
    redirect("/login");
  }
  // Asegura que la configuración de la tienda exista.
  await getOrCreatePageConfig(contexto.tenantId);
  const result = await getPageConfig();
  const pageConfig = result?.pageConfig ?? {};

  return (
    <ProveedorConfiguracionPagina pageConfig={{ ok: true, pageConfig }}>
      <ProveedorTemaAdmin>
        <LayoutComponent>
          <RouteLoader />
          {children}
        </LayoutComponent>
      </ProveedorTemaAdmin>
    </ProveedorConfiguracionPagina>
  );
}
