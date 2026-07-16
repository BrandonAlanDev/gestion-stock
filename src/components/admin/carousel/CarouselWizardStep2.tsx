"use client";

import { useState } from "react";
import HeroLayoutPicker from "./HeroLayoutPicker";
import BannerHeightPicker from "./BannerHeightPicker";
import CardsLayoutPicker from "./CardsLayoutPicker";
import { ChevronLeft } from "lucide-react";
import { getContrastColor } from "@/lib/utils";

interface CarouselWizardStep2Props {
  type: "HERO" | "BANNER" | "CARDS";
  heroStyle?: "DEFAULT" | "SHOWCASE";
  initialSettings: Record<string, unknown>;
  onComplete: (settings: Record<string, unknown>) => void;
  onBack: () => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function CarouselWizardStep2({
  type,
  heroStyle,
  initialSettings,
  onComplete,
  onBack,
  primaryColor,
  secondaryColor,
}: CarouselWizardStep2Props) {
  const [settings, setSettings] = useState<Record<string, unknown>>(
    initialSettings
  );

  const textColor = getContrastColor(secondaryColor);

  const handleChange = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onComplete(settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors"
          style={{ color: textColor + "99" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "1A"; e.currentTarget.style.color = textColor; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "99"; }}
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors"
          style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Continuar
        </button>
      </div>

      <div className="pt-4" style={{ borderColor: primaryColor + "40" }}>
        <h3 className="text-sm font-medium mb-4" style={{ color: textColor + "CC" }}>
          Configuración específica para {type}{heroStyle === "SHOWCASE" ? " Showcase" : ""}
        </h3>

        {type === "HERO" && heroStyle === "DEFAULT" && (
          <div className="space-y-6">
            <HeroLayoutPicker
              value={settings.slideLayout as "standard" | "split" | "minimal"}
              onChange={(v) => handleChange("slideLayout", v)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            <div className="space-y-3">
              <h4 className="text-sm font-medium" style={{ color: textColor + "CC" }}>Opciones de reproducción</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoPlay ?? true}
                    onChange={(e) => handleChange("autoPlay", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Auto-play</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showDots ?? true}
                    onChange={(e) => handleChange("showDots", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Mostrar puntos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showNavButtons ?? true}
                    onChange={(e) => handleChange("showNavButtons", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Botones prev/next</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer flex-col items-start">
                  <span className="text-sm" style={{ color: textColor }}>
                    Opacidad overlay: {Math.round((settings.overlayOpacity ?? 0.9) * 100)}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(settings.overlayOpacity ?? 0.9) * 100}
                    onChange={(e) => handleChange("overlayOpacity", Number(e.target.value) / 100)}
                    className="w-full h-2 rounded-lg appearance-none"
                    style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>
                  Duración transición: {settings.transitionDuration || 6000}ms
                </label>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="500"
                  value={settings.transitionDuration || 6000}
                  onChange={(e) => handleChange("transitionDuration", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                />
              </div>
            </div>
          </div>
        )}

        {type === "HERO" && heroStyle === "SHOWCASE" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>
                  Altura del showcase: {settings.height || 500}px
                </label>
                <input
                  type="range"
                  min="300"
                  max="800"
                  step="50"
                  value={settings.height || 500}
                  onChange={(e) => handleChange("height", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>
                  Gap entre slides: {settings.gap || 16}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="4"
                  value={settings.gap || 16}
                  onChange={(e) => handleChange("gap", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>
                  Autoplay cada: {((settings.autoplayDelay || 5000) / 1000).toFixed(0)}s
                </label>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="1000"
                  value={settings.autoplayDelay || 5000}
                  onChange={(e) => handleChange("autoplayDelay", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                />
              </div>
              <h4 className="text-sm font-medium pt-2" style={{ color: textColor + "CC" }}>Opciones de visualización</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showDots ?? true}
                    onChange={(e) => handleChange("showDots", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Mostrar puntos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showArrows ?? true}
                    onChange={(e) => handleChange("showArrows", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Mostrar flechas</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {type === "BANNER" && (
          <div className="space-y-6">
            <BannerHeightPicker
              value={settings.height || 300}
              onChange={(v) => handleChange("height", v)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            <div className="space-y-3">
              <h4 className="text-sm font-medium" style={{ color: textColor + "CC" }}>Opciones de reproducción</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoPlay ?? true}
                    onChange={(e) => handleChange("autoPlay", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Auto-play</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showDots ?? true}
                    onChange={(e) => handleChange("showDots", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Mostrar puntos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showNavButtons ?? false}
                    onChange={(e) => handleChange("showNavButtons", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm" style={{ color: textColor }}>Botones prev/next</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>
                  Duración transición: {settings.transitionDuration || 4000}ms
                </label>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="500"
                  value={settings.transitionDuration || 4000}
                  onChange={(e) => handleChange("transitionDuration", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                />
              </div>
            </div>
          </div>
        )}

        {type === "CARDS" && (
          <div className="space-y-6">
            <CardsLayoutPicker
              layout={settings.layout || "grid"}
              onLayoutChange={(v) => handleChange("layout", v)}
              columns={settings.columns || "md:grid-cols-2"}
              onColumnsChange={(v) => handleChange("columns", v)}
              cardHeight={settings.cardHeight || "50vh"}
              onCardHeightChange={(v) => handleChange("cardHeight", v)}
              showSubtitle={settings.showSubtitle ?? true}
              onShowSubtitleChange={(v) => handleChange("showSubtitle", v)}
              enableHoverZoom={settings.enableHoverZoom ?? true}
              onEnableHoverZoomChange={(v) => handleChange("enableHoverZoom", v)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}
