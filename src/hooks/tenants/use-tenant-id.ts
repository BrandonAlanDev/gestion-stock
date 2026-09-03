"use client";

import { useContext } from "react";
import { ContextoTenantCliente } from "@/contextos/tenants/contexto-tenant-cliente";

/** Solo identifica keys y storage del cliente; no concede autorización. */
export function useTenantId(): string | null {
  return useContext(ContextoTenantCliente);
}
