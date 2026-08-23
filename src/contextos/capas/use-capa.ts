"use client";

import { useContext } from "react";
import { ContextoCapas } from "./contexto-capas";
import { CAPA_BASE_MODAL, INCREMENTO_NIVEL } from "./constantes-capas";

export function useCapa(): { nivel: number; zIndice: number } {
  const nivel = useContext(ContextoCapas);
  return { nivel, zIndice: CAPA_BASE_MODAL + nivel * INCREMENTO_NIVEL };
}
