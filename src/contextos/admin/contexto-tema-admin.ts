import { createContext } from "react";

export type TemaAdmin = "claro" | "oscuro";

export interface ValorTemaAdmin {
  tema: TemaAdmin;
  alternarTema: () => void;
}

export const ContextoTemaAdmin = createContext<ValorTemaAdmin | null>(null);
