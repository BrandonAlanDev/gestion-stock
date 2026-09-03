"use client";

import { useContext } from "react";
import {
  ContextoConfiguracionPaginaReact,
  type ContextoConfiguracionPagina,
} from "@/contextos/configuracion-pagina/contexto-configuracion-pagina";

export function usePageConfig(): ContextoConfiguracionPagina {
  const ctx = useContext(ContextoConfiguracionPaginaReact);
  return ctx ?? { ok: false, pageConfig: {} };
}
