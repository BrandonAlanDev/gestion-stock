import { Check } from "lucide-react";
import type { PlantillaColor } from "@/lib/plantillas-colores";
import { cn } from "@/lib/utils";

import VistaPreviaPlantilla from "./VistaPreviaPlantilla";

interface TarjetaPlantillaColorProps {
  plantilla: PlantillaColor;
  seleccionada: boolean;
  alSeleccionar: () => void;
  nombreNegocio: string;
}

export default function TarjetaPlantillaColor({
  plantilla,
  seleccionada,
  alSeleccionar,
  nombreNegocio,
}: TarjetaPlantillaColorProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      onClick={alSeleccionar}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primario)]",
        seleccionada
          ? "border-[var(--admin-primario)] bg-[var(--admin-primario-suave)]/40 ring-1 ring-[var(--admin-primario)]/40"
          : "border-[var(--admin-borde)] bg-[var(--admin-fondo)] hover:-translate-y-0.5 hover:border-[var(--admin-primario)] hover:shadow-lg hover:shadow-black/20"
      )}
    >
      {seleccionada && (
        <span
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--admin-primario)" }}
        >
          <Check className="h-3 w-3" style={{ color: "var(--admin-primario-texto)" }} />
          <span className="sr-only">Seleccionada</span>
        </span>
      )}
      <p className="text-sm font-semibold text-[var(--admin-texto)]">
        {plantilla.nombre}
      </p>
      <VistaPreviaPlantilla plantilla={plantilla} nombreNegocio={nombreNegocio} />
      <p className="text-xs leading-snug text-[var(--admin-texto-suave)]">
        {plantilla.descripcion}
      </p>
    </button>
  );
}
