"use client";

import type { ReactNode } from "react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

interface ProductsToolbarProps {
  children: ReactNode;
}

export default function ProductsToolbar({ children }: ProductsToolbarProps) {
  const paleta = useAdminPaleta();

  return (
    <div
      className="rounded-xl border p-3 sm:p-4"
      style={{ backgroundColor: paleta.fondo, borderColor: paleta.borde }}
    >
      {children}
    </div>
  );
}
