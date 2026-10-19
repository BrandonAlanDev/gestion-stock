import { redirect } from "next/navigation";
import ProveedorTemaAdmin from "@/components/admin/tema/ProveedorTemaAdmin";
import { requerirAdministradorTenant } from "@/lib/tenants/requerir-administrador-tenant";
import LayoutComponent from "@/components/layout/LayoutComponent";
import RouteLoader from "@/components/layout/RouteLoader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requerirAdministradorTenant();
  } catch {
    redirect("/login");
  }

  return (
    <ProveedorTemaAdmin>
      <LayoutComponent>
        <RouteLoader />
        {children}
      </LayoutComponent>
    </ProveedorTemaAdmin>
  );
}
