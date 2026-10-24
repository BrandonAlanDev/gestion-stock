"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const ContextoTenantPublico = createContext<string | null>(null);

export function ProveedorTenantPublico({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  return <ContextoTenantPublico.Provider value={tenantId}>{children}</ContextoTenantPublico.Provider>;
}

export function useTenantPublico() {
  return useContext(ContextoTenantPublico);
}
