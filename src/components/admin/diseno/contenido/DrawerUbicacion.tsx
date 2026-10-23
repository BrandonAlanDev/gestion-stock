"use client";

import Sheet from "@/components/ui/sheet";
import LocationSection from "@/components/admin/page-config/LocationSection";

import type { ConfigContenido } from "./tipos-contenido";

type ConfigUbicacion = Pick<
  ConfigContenido,
  | "locationEnabled"
  | "retiroTiendaEnabled"
  | "address"
  | "postalCode"
  | "city"
  | "province"
  | "country"
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
  const configObjeto: ConfigUbicacion = config;

  return (
    <Sheet
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Ubicación y retiro"
      descripcion="Dirección pública y lugar de retiro en el checkout"
      anchoClases="w-full sm:w-[520px]"
    >
      <LocationSection
        config={configObjeto}
        checkoutEnabled={config.checkoutEnabled}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </Sheet>
  );
}
