import { createContext } from "react";
import type { PageConfig } from "../../../generated/prisma/client";

export interface ContextoConfiguracionPagina {
  ok: boolean;
  pageConfig: Partial<PageConfig>;
}

export const ContextoConfiguracionPaginaReact =
  createContext<ContextoConfiguracionPagina | null>(null);
