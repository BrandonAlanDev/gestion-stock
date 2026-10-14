// Plantillas de colores para el selector del panel administrador.
import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";
import { plantillasClarasComercio } from "@/lib/plantillas-colores/plantillas-claras-comercio";
import { plantillasClarasEstilos } from "@/lib/plantillas-colores/plantillas-claras-estilos";
import { plantillasOscurasComercio } from "@/lib/plantillas-colores/plantillas-oscuras-comercio";
import { plantillasOscurasEstilos } from "@/lib/plantillas-colores/plantillas-oscuras-estilos";
import type { PlantillaColor } from "@/lib/plantillas-colores/tipos-plantilla-color";

export type { PlantillaColor } from "@/lib/plantillas-colores/tipos-plantilla-color";

export const PLANTILLAS_COLORES: PlantillaColor[] = [
  ...plantillasClarasComercio,
  ...plantillasClarasEstilos,
  ...plantillasOscurasComercio,
  ...plantillasOscurasEstilos,
];

for (const plantilla of PLANTILLAS_COLORES) {
  if (
    !esColorHexValido(plantilla.primaryColor) ||
    !esColorHexValido(plantilla.secondaryColor) ||
    !esColorHexValido(plantilla.bgColor)
  ) {
    throw new Error(`La plantilla "${plantilla.nombre}" define un color inválido.`);
  }
}
