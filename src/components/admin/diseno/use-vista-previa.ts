"use client";

import { useContext } from "react";

import {
  ContextoVistaPrevia,
  type ContextoVistaPreviaValor,
} from "./contexto-vista-previa";

export default function useVistaPrevia(): ContextoVistaPreviaValor {
  const contexto = useContext(ContextoVistaPrevia);
  if (!contexto) {
    throw new Error(
      "useVistaPrevia debe usarse dentro de ProveedorVistaPrevia"
    );
  }
  return contexto;
}
