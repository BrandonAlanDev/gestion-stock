"use client";

import { useContext } from "react";
import { ContextoTemaAdmin } from "@/contextos/admin/contexto-tema-admin";

export function useTemaAdmin() {
  const contexto = useContext(ContextoTemaAdmin);
  if (!contexto) {
    throw new Error("useTemaAdmin debe usarse dentro de ProveedorTemaAdmin");
  }
  return contexto;
}
