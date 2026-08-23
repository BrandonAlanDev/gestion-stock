import { Eye } from "lucide-react";

import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";
import { PLANTILLAS_COLORES } from "@/lib/plantillas-colores";
import type { PlantillaColor } from "@/lib/plantillas-colores";

import VistaPreviaPlantilla from "./VistaPreviaPlantilla";

interface VistaPreviaPersonalizadaProps {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  nombreNegocio: string;
}

export default function VistaPreviaPersonalizada({
  colorPrimario,
  colorSecundario,
  colorFondo,
  nombreNegocio,
}: VistaPreviaPersonalizadaProps) {
  if (
    !esColorHexValido(colorPrimario) ||
    !esColorHexValido(colorSecundario) ||
    !esColorHexValido(colorFondo)
  ) {
    return null;
  }

  const colorCoincide = (colorA: string, colorB: string) =>
    colorA.trim().toUpperCase() === colorB.trim().toUpperCase();

  const coincideConPlantilla = PLANTILLAS_COLORES.some(
    (plantilla) =>
      colorCoincide(plantilla.primaryColor, colorPrimario) &&
      colorCoincide(plantilla.secondaryColor, colorSecundario) &&
      colorCoincide(plantilla.bgColor, colorFondo)
  );

  if (coincideConPlantilla) {
    return null;
  }

  const plantillaPersonalizada: PlantillaColor = {
    id: "personalizada",
    nombre: "Personalizada",
    descripcion: "",
    primaryColor: colorPrimario,
    secondaryColor: colorSecundario,
    bgColor: colorFondo,
  };

  return (
    <div className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-[var(--admin-texto-suave)]" />
        <h4 className="text-sm font-semibold text-[var(--admin-texto)]">Vista previa</h4>
      </div>
      <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
        Así se verá tu combinación personalizada en la página.
      </p>
      <div className="mt-3 max-w-sm">
        <VistaPreviaPlantilla
          plantilla={plantillaPersonalizada}
          nombreNegocio={nombreNegocio}
        />
      </div>
    </div>
  );
}
