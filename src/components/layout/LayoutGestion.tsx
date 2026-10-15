import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import LayoutComponent from "@/components/layout/LayoutComponent";
import RouteLoader from "@/components/layout/RouteLoader";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";

export default async function LayoutGestion({ children }: { children: ReactNode }) {
  try {
    await requiereUsuarioTenant();
  } catch {
    redirect("/login?recuperarSesion=1");
  }

  return (
    <LayoutComponent>
      <RouteLoader />
      {children}
    </LayoutComponent>
  );
}
