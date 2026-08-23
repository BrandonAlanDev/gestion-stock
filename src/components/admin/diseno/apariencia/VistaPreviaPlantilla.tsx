import type { PlantillaColor } from "@/lib/plantillas-colores";
import { getContrastColor } from "@/lib/utils";

const CHIPS_FANTASMA = ["Productos", "Categorías", "Envíos"];

interface VistaPreviaPlantillaProps {
  plantilla: PlantillaColor;
  nombreNegocio: string;
}

export default function VistaPreviaPlantilla({
  plantilla,
  nombreNegocio,
}: VistaPreviaPlantillaProps) {
  const textoSobreFondo = getContrastColor(plantilla.bgColor);

  return (
    <div
      className="overflow-hidden rounded-lg border border-white/10"
      style={{ backgroundColor: plantilla.bgColor }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          backgroundColor: `color-mix(in srgb, ${plantilla.secondaryColor} 10%, transparent)`,
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: plantilla.primaryColor }}
          />
          <span
            className="truncate text-[10px] font-semibold"
            style={{ color: textoSobreFondo }}
          >
            {nombreNegocio.trim() || "Mi Tienda"}
          </span>
        </div>
        <span
          className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
          style={{
            backgroundColor: plantilla.primaryColor,
            color: getContrastColor(plantilla.primaryColor),
          }}
        >
          Tienda
        </span>
      </div>

      <div className="space-y-2 px-3 py-3">
        <div className="h-1.5 w-3/4 rounded-full bg-zinc-700" />
        <div className="h-1.5 w-1/2 rounded-full bg-zinc-700" />
        <div className="pt-1">
          <span
            className="rounded-md px-2.5 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor: plantilla.primaryColor,
              color: getContrastColor(plantilla.primaryColor),
            }}
          >
            Comprar
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
        {CHIPS_FANTASMA.map((chip) => (
          <span
            key={chip}
            className="rounded-md border px-2 py-1 text-[9px]"
            style={{
              borderColor: `color-mix(in srgb, ${plantilla.secondaryColor} 35%, transparent)`,
              color: textoSobreFondo,
            }}
          >
            {chip}
          </span>
        ))}
      </div>

      <div
        className="h-[3px]"
        style={{
          backgroundImage: `linear-gradient(to right, ${plantilla.primaryColor}, ${plantilla.secondaryColor})`,
        }}
      />
    </div>
  );
}
