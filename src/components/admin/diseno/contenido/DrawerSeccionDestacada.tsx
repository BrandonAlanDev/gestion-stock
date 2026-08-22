"use client";

import Sheet from "@/components/ui/sheet";
import HomeSectionsDesign from "@/components/admin/design/HomeSectionsDesign";

import type { ConfigContenido } from "./tipos-contenido";

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  config: ConfigContenido;
  primaryColor: string;
  secondaryColor: string;
}

export default function DrawerSeccionDestacada({
  abierto,
  alCerrar,
  config,
  primaryColor,
  secondaryColor,
}: Props) {
  return (
    <Sheet
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Sección destacada"
      descripcion="Cuadrícula de productos y categorías de la home"
      anchoClases="w-full sm:w-[600px]"
    >
      <HomeSectionsDesign
        config={config}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        alGuardar={alCerrar}
      />
    </Sheet>
  );
}
