"use client";

import type { ReactNode } from "react";
import { CLASE_SUPERFICIE } from "@/lib/productos/estilos";

interface ProductsToolbarProps {
  children: ReactNode;
}

export default function ProductsToolbar({ children }: ProductsToolbarProps) {
  return <div className={`${CLASE_SUPERFICIE} p-3 sm:p-4`}>{children}</div>;
}
