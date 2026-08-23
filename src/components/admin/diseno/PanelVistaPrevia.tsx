"use client";

import { useState } from "react";
import {
  ExternalLink,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";

import Sheet from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import useVistaPrevia from "./use-vista-previa";
import type { DispositivoVistaPrevia } from "./contexto-vista-previa";

const DISPOSITIVOS: {
  valor: DispositivoVistaPrevia;
  etiqueta: string;
  icono: LucideIcon;
}[] = [
  { valor: "desktop", etiqueta: "Escritorio", icono: Monitor },
  { valor: "tablet", etiqueta: "Tablet", icono: Tablet },
  { valor: "mobile", etiqueta: "Móvil", icono: Smartphone },
];

const ANCHOS: Record<DispositivoVistaPrevia, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export default function PanelVistaPrevia() {
  const {
    abierta,
    pagina,
    dispositivo,
    cerrarVistaPrevia,
    cambiarDispositivo,
  } = useVistaPrevia();
  const [claveActualizacion, setClaveActualizacion] = useState(0);

  const url = pagina ? `/page?title=${encodeURIComponent(pagina)}` : "/";

  return (
    <Sheet
      abierto={abierta}
      alCerrar={cerrarVistaPrevia}
      titulo="Vista previa"
      descripcion={pagina ? `Página: ${pagina}` : "Página: Inicio"}
      anchoClases="w-full sm:w-[90vw] sm:max-w-[1100px]"
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-1">
            {DISPOSITIVOS.map((d) => (
              <button
                key={d.valor}
                type="button"
                onClick={() => cambiarDispositivo(d.valor)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  dispositivo === d.valor
                    ? "bg-[var(--admin-primario)] text-[var(--admin-primario-texto)]"
                    : "text-[var(--admin-texto-suave)] hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
                )}
              >
                <d.icono size={14} />
                <span className="hidden sm:inline">{d.etiqueta}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setClaveActualizacion((v) => v + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-borde)] px-3 py-1.5 text-xs font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]"
            >
              <RotateCw size={13} />
              Refrescar
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-borde)] px-3 py-1.5 text-xs font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]"
            >
              <ExternalLink size={13} />
              Abrir en pestaña
            </a>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 justify-center overflow-hidden">
          <div
            className="h-full overflow-hidden rounded-lg border border-[var(--admin-borde)] bg-white transition-all duration-300"
            style={{ width: ANCHOS[dispositivo], maxWidth: "100%" }}
          >
            <iframe
              key={claveActualizacion}
              src={url}
              title="Vista previa del sitio"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </Sheet>
  );
}
