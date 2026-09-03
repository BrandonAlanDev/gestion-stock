"use client";

import type { ReactNode } from "react";
import {
  ContextoConfiguracionPaginaReact,
  type ContextoConfiguracionPagina,
} from "@/contextos/configuracion-pagina/contexto-configuracion-pagina";

interface PropiedadesProveedorConfiguracionPagina {
  children: ReactNode;
  pageConfig: ContextoConfiguracionPagina;
}

export function ProveedorConfiguracionPagina({
  children,
  pageConfig,
}: PropiedadesProveedorConfiguracionPagina) {
  return (
    <ContextoConfiguracionPaginaReact.Provider value={pageConfig}>
      {children}
    </ContextoConfiguracionPaginaReact.Provider>
  );
}
