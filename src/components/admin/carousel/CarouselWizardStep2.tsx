"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { getContrastColor } from "@/lib/utils";
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
  primaryColor: string;
  secondaryColor: string;
  hideNav?: boolean;
  hideLayoutPicker?: boolean;
}

export default function CarouselWizardStep2({
  type,
  heroStyle,
  initialSettings,
  onComplete,
  onBack,
  primaryColor,
  secondaryColor,
  hideNav = false,
  hideLayoutPicker = false,
}: CarouselWizardStep2Props) {
  const [settings, setSettings] = useState<Record<string, unknown>>(
    initialSettings
  );

  const textColor = getContrastColor(secondaryColor);

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
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
            style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = textColor + "0A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Continuar
          </button>
        </div>
      )}

      <div className="pt-4" style={{ borderColor: primaryColor + "40" }}>
        <h3 className="text-sm font-medium mb-4" style={{ color: textColor + "CC" }}>
          Configuración de {TYPE_LABELS[type] || type}{isShowcase ? " - galería" : ""}
        </h3>

        <ControlesConfiguracion
          tipo={type}
          variante={isShowcase ? "SHOWCASE" : "DEFAULT"}
          definiciones={obtenerConfiguraciones(type, isShowcase ? "SHOWCASE" : "DEFAULT")}
          ajustes={settings}
          alCambiar={handleChange}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          ocultarSeleccionLayout={hideLayoutPicker}
        />
      </div>
    </div>
  );
}
