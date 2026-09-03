"use client";

import Sheet from "@/components/ui/sheet";
import LocationSection from "@/components/admin/page-config/LocationSection";

import type { ConfigContenido } from "./tipos-contenido";

type ConfigUbicacion = Pick<
  ConfigContenido,
  "locationEnabled" | "address" | "city" | "province" | "country"
>;

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  config: ConfigContenido;
  primaryColor: string;
  secondaryColor: string;
}

export default function DrawerUbicacion({
  abierto,
  alCerrar,
  config,
  primaryColor,
  secondaryColor,
}: Props) {
  const configObjeto = config as unknown as ConfigUbicacion;

  return (
    <Sheet
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Ubicación"
      descripcion="Dirección que se muestra en tu tienda"
      anchoClases="w-full sm:w-[520px]"
    >
      <LocationSection
        config={configObjeto}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </Sheet>
  );
}
