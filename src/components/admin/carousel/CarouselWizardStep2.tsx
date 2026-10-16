"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import ControlesConfiguracion from "./ControlesConfiguracion";
import { obtenerConfiguraciones } from "./registroConfiguraciones";

const TYPE_LABELS: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};

interface CarouselWizardStep2Props {
  type: "HERO" | "BANNER" | "CARDS";
  heroStyle?: "DEFAULT" | "SHOWCASE";
  initialSettings: Record<string, unknown>;
  onComplete: (settings: Record<string, unknown>) => void;
  onBack: () => void;
  hideNav?: boolean;
  hideLayoutPicker?: boolean;
}

export default function CarouselWizardStep2({
  type,
  heroStyle,
  initialSettings,
  onComplete,
  onBack,
  hideNav = false,
  hideLayoutPicker = false,
}: CarouselWizardStep2Props) {
  const [settings, setSettings] = useState<Record<string, unknown>>(
    initialSettings
  );

  useEffect(() => {
    if (hideNav) {
      onComplete(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleChange = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onComplete(settings);
  };

  const isShowcase = heroStyle === "SHOWCASE";

  return (
    <div className="space-y-6">
      {!hideNav && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--admin-borde)] px-4 py-2 font-medium text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 font-black uppercase tracking-wider text-[var(--admin-primario-texto)] transition-colors hover:opacity-90"
          >
            Continuar
          </button>
        </div>
      )}

      <div className="border-t border-[var(--admin-borde)] pt-4">
        <h3 className="mb-4 text-sm font-medium text-[var(--admin-texto)]">
          Configuración de {TYPE_LABELS[type] || type}{isShowcase ? " - galería" : ""}
        </h3>

        <ControlesConfiguracion
          tipo={type}
          variante={isShowcase ? "SHOWCASE" : "DEFAULT"}
          definiciones={obtenerConfiguraciones(type, isShowcase ? "SHOWCASE" : "DEFAULT")}
          ajustes={settings}
          alCambiar={handleChange}
          ocultarSeleccionLayout={hideLayoutPicker}
        />
      </div>
    </div>
  );
}
