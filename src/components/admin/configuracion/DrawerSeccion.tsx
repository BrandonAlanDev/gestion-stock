"use client";

import type { ReactNode } from "react";

import Sheet from "@/components/ui/sheet";

interface DrawerSeccionProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  anchoClases?: string;
}

export default function DrawerSeccion({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  children,
  anchoClases,
}: DrawerSeccionProps) {
  return (
    <Sheet
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={titulo}
      descripcion={descripcion}
      anchoClases={anchoClases ?? "w-full sm:w-[560px]"}
    >
      {children}
    </Sheet>
  );
}
