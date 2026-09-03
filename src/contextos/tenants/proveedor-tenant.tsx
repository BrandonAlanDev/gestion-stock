"use client";

import type { ReactNode } from "react";
import { ContextoTenantCliente } from "@/contextos/tenants/contexto-tenant-cliente";

interface PropiedadesTenantProvider {
  children: ReactNode;
  tenantId: string | null;
}

export function TenantProvider({
  children,
  tenantId,
}: PropiedadesTenantProvider) {
  return (
    <ContextoTenantCliente.Provider value={tenantId}>
      {children}
    </ContextoTenantCliente.Provider>
  );
}
