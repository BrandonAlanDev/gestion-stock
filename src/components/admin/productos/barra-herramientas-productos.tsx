"use client";

import type { ReactNode } from "react";
import { CLASE_SUPERFICIE } from "@/lib/productos/estilos";

interface BarraHerramientasProductosProps {
  children: ReactNode;
}

export default function BarraHerramientasProductos({ children }: BarraHerramientasProductosProps) {
  return <div className={`${CLASE_SUPERFICIE} p-3 sm:p-4`}>{children}</div>;
}
