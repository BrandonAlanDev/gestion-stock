import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import LayoutComponent from "@/components/layout/LayoutComponent";
import RouteLoader from "@/components/layout/RouteLoader";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export default async function LayoutGestion({ children }: { children: ReactNode }) {
  try {
    await requiereAdmin();
  } catch {
    redirect("/login");
  }

  return (
    <LayoutComponent>
      <RouteLoader />
      {children}
    </LayoutComponent>
  );
}
