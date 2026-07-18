"use client";

import { useState, useEffect } from "react";
import HeroLayoutPicker from "./HeroLayoutPicker";
import BannerHeightPicker from "./BannerHeightPicker";
import { ChevronLeft } from "lucide-react";
import { getContrastColor } from "@/lib/utils";

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

        {type === "HERO" && !isShowcase && (
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
                  Duración: {(settings.transitionDuration || 6000) / 1000} segundos
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={(settings.transitionDuration || 6000) / 1000}
                  onChange={(e) => handleChange("transitionDuration", Number(e.target.value) * 1000)}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                />
              </div>
            </div>
          </div>
        )}

        {type === "HERO" && isShowcase && (
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
                  Separación entre imágenes: {settings.gap || 16}px
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
                  Autoplay cada: {((settings.autoplayDelay || 5000) / 1000).toFixed(0)} segundos
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={(settings.autoplayDelay || 5000) / 1000}
                  onChange={(e) => handleChange("autoplayDelay", Number(e.target.value) * 1000)}
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

        {type === "BANNER" && !isShowcase && (
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
                  Duración: {(settings.transitionDuration || 4000) / 1000} segundos
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={(settings.transitionDuration || 4000) / 1000}
                  onChange={(e) => handleChange("transitionDuration", Number(e.target.value) * 1000)}
                  className="w-full h-2 rounded-lg appearance-none"
                  style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                />
              </div>
            </div>
          </div>
        )}

        {type === "BANNER" && isShowcase && (
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
                  Separación entre imágenes: {settings.gap || 16}px
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
                  Autoplay cada: {((settings.autoplayDelay || 5000) / 1000).toFixed(0)} segundos
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={(settings.autoplayDelay || 5000) / 1000}
                  onChange={(e) => handleChange("autoplayDelay", Number(e.target.value) * 1000)}
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

        {type === "CARDS" && !isShowcase && (
          <div className="space-y-6">
            {!hideLayoutPicker && (
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Estilo de tarjetas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange("layout", "simple")}
                    className="relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
                    style={{
                      borderColor: (settings.layout || "simple") === "simple" ? primaryColor : textColor + "30",
                      backgroundColor: (settings.layout || "simple") === "simple" ? primaryColor + "15" : "transparent",
                    }}
                  >
                    <span className="font-bold block text-sm" style={{ color: textColor }}>Simple</span>
                    <span className="text-xs block" style={{ color: textColor + "80" }}>Cuadrícula de tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("layout", "offers")}
                    className="relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
                    style={{
                      borderColor: settings.layout === "offers" ? primaryColor : textColor + "30",
                      backgroundColor: settings.layout === "offers" ? primaryColor + "15" : "transparent",
                    }}
                  >
                    <span className="font-bold block text-sm" style={{ color: textColor }}>Ofertas</span>
                    <span className="text-xs block" style={{ color: textColor + "80" }}>Carrusel de ofertas con descuento</span>
                  </button>
                </div>
              </div>
            )}

            {(settings.layout || "simple") === "simple" ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>Columnas (md+)</label>
                    <select
                      value={settings.columns || "md:grid-cols-2"}
                      onChange={(e) => handleChange("columns", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg outline-none transition-all"
                      style={{ backgroundColor: textColor + "1A", border: "1px solid " + textColor + "30", color: textColor }}
                    >
                      <option value="md:grid-cols-1" style={{ backgroundColor: secondaryColor, color: textColor }}>1 columna</option>
                      <option value="md:grid-cols-2" style={{ backgroundColor: secondaryColor, color: textColor }}>2 columnas</option>
                      <option value="md:grid-cols-3" style={{ backgroundColor: secondaryColor, color: textColor }}>3 columnas</option>
                      <option value="md:grid-cols-4" style={{ backgroundColor: secondaryColor, color: textColor }}>4 columnas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>Alto de tarjetas</label>
                    <select
                      value={settings.cardHeight || "50vh"}
                      onChange={(e) => handleChange("cardHeight", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg outline-none transition-all"
                      style={{ backgroundColor: textColor + "1A", border: "1px solid " + textColor + "30", color: textColor }}
                    >
                      <option value="40vh" style={{ backgroundColor: secondaryColor, color: textColor }}>40vh (compacto)</option>
                      <option value="50vh" style={{ backgroundColor: secondaryColor, color: textColor }}>50vh (estándar)</option>
                      <option value="60vh" style={{ backgroundColor: secondaryColor, color: textColor }}>60vh (grande)</option>
                      <option value="70vh" style={{ backgroundColor: secondaryColor, color: textColor }}>70vh (extra grande)</option>
                      <option value="80vh" style={{ backgroundColor: secondaryColor, color: textColor }}>80vh (hero)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showSubtitle ?? true}
                      onChange={(e) => handleChange("showSubtitle", e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-sm" style={{ color: textColor }}>Mostrar subtítulo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableHoverZoom ?? true}
                      onChange={(e) => handleChange("enableHoverZoom", e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="text-sm" style={{ color: textColor }}>Zoom al hover</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>
                    Altura: {settings.height || 500}px
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
                    Separación entre imágenes: {settings.gap || 16}px
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
                    Autoplay cada: {((settings.autoplayDelay || 5000) / 1000).toFixed(0)} segundos
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={(settings.autoplayDelay || 5000) / 1000}
                    onChange={(e) => handleChange("autoplayDelay", Number(e.target.value) * 1000)}
                    className="w-full h-2 rounded-lg appearance-none"
                    style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={settings.hideButtons === true}
                    onChange={(e) => handleChange("hideButtons", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-sm font-medium" style={{ color: textColor }}>Ocultar todos los botones</span>
                </label>
              </div>
            )}
          </div>
        )}

        {type === "CARDS" && isShowcase && (
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
                  Separación entre imágenes: {settings.gap || 16}px
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
                  Autoplay cada: {((settings.autoplayDelay || 5000) / 1000).toFixed(0)} segundos
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={(settings.autoplayDelay || 5000) / 1000}
                  onChange={(e) => handleChange("autoplayDelay", Number(e.target.value) * 1000)}
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
      </div>
    </div>
  );
}