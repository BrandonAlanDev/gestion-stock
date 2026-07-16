"use client";

import { useState, useEffect } from "react";
import { cn, getContrastColor } from "@/lib/utils";

const TYPES = [
  { id: "HERO" as const, icon: "🖥️", label: "Hero", desc: "Carrusel fullscreen destacado" },
  { id: "BANNER" as const, icon: "📢", label: "Banner", desc: "Franja horizontal rotativa" },
  { id: "CARDS" as const, icon: "🎴", label: "Cards", desc: "Grilla de tarjetas" },
];

const HERO_STYLES = [
  { id: "DEFAULT" as const, label: "Predeterminado", desc: "Hero fullscreen clásico con transiciones" },
  { id: "SHOWCASE" as const, label: "Showcase", desc: "Galería horizontal 3 visibles, scroll 1" },
];

interface CarouselWizardStep1Props {
  initialType?: "HERO" | "BANNER" | "CARDS";
  initialTitle?: string;
  initialHeroStyle?: "DEFAULT" | "SHOWCASE";
  onComplete: (data: { type: "HERO" | "BANNER" | "CARDS"; title: string; heroStyle?: "DEFAULT" | "SHOWCASE" }) => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function CarouselWizardStep1({
  initialType,
  initialTitle,
  initialHeroStyle,
  onComplete,
  primaryColor,
  secondaryColor,
}: CarouselWizardStep1Props) {
  const [selectedType, setSelectedType] = useState<"HERO" | "BANNER" | "CARDS">(initialType || "HERO");
  const [heroStyle, setHeroStyle] = useState<"DEFAULT" | "SHOWCASE">(initialHeroStyle || "DEFAULT");
  const [title, setTitle] = useState(initialTitle || "");
  const [limits, setLimits] = useState({ HERO: 1, BANNER: 1, CARDS: 3 });
  const [currentCounts, setCurrentCounts] = useState({ HERO: 0, BANNER: 0, CARDS: 0 });

  const textColor = getContrastColor(secondaryColor);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/carousels?admin=true");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLimits(data.limits || { HERO: 1, BANNER: 1, CARDS: 3 });
            setCurrentCounts(data.counts || { HERO: 0, BANNER: 0, CARDS: 0 });
          }
        }
      } catch (e) {
        console.error("Error fetching limits:", e);
      }
    };
    fetchData();
  }, []);

  const isAtLimit = (type: "HERO" | "BANNER" | "CARDS") => {
    const count = currentCounts[type] || 0;
    const adjusted = initialType === type ? Math.max(0, count - 1) : count;
    return adjusted >= limits[type];
  };

  const handleContinue = () => {
    onComplete({ type: selectedType, title: title.trim(), heroStyle: selectedType === "HERO" ? heroStyle : undefined });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Tipo de carrusel</label>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((type) => {
            const atLimit = isAtLimit(type.id);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => { setSelectedType(type.id); if (type.id !== "HERO") setHeroStyle("DEFAULT"); }}
                disabled={atLimit}
                className={cn("relative p-4 rounded-xl border-2 transition-all text-left")}
                style={{
                  borderColor: selectedType === type.id ? primaryColor : atLimit ? textColor + "40" : textColor + "30",
                  backgroundColor: selectedType === type.id ? primaryColor + "15" : "transparent",
                  opacity: atLimit ? 0.5 : 1,
                  cursor: atLimit ? "not-allowed" : "pointer",
                }}
              >
                <span className="text-3xl block mb-2">{type.icon}</span>
                <span className="font-bold block mb-1" style={{ color: textColor }}>{type.label}</span>
                <span className="text-xs block mb-2" style={{ color: textColor + "80" }}>{type.desc}</span>

                {atLimit && (
                  <span className="absolute bottom-2 left-2 right-2 text-xs px-2 py-1 rounded" style={{ color: primaryColor, backgroundColor: primaryColor + "20" }}>
                    Límite alcanzado ({currentCounts[type.id]}/{limits[type.id]})
                  </span>
                )}

                {selectedType === type.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-4 h-4" style={{ color: getContrastColor(primaryColor) }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs" style={{ color: textColor + "80" }}>
          {(["HERO","BANNER","CARDS"] as const).map((t) => {
            const atLimit = currentCounts[t] >= limits[t];
            return (
              <div key={t} className="px-2 py-1 rounded" style={{ backgroundColor: atLimit ? primaryColor + "20" : textColor + "1A", color: atLimit ? primaryColor : textColor + "80" }}>
                {t}: {currentCounts[t]}/{limits[t]}
              </div>
            );
          })}
        </div>
      </div>

      {selectedType === "HERO" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Estilo de Hero</label>
          <div className="grid grid-cols-2 gap-2">
            {HERO_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setHeroStyle(style.id)}
                className="relative p-3 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: heroStyle === style.id ? primaryColor : textColor + "30",
                  backgroundColor: heroStyle === style.id ? primaryColor + "15" : "transparent",
                }}
              >
                <span className="font-bold block text-sm" style={{ color: textColor }}>{style.label}</span>
                <span className="text-xs block" style={{ color: textColor + "80" }}>{style.desc}</span>
                {heroStyle === style.id && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-3 h-3" style={{ color: getContrastColor(primaryColor) }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {(selectedType === "BANNER" || selectedType === "CARDS") && (
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Título de la sección</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Ofertas de verano, Categorías principales..."
            className="w-full px-3 py-2 rounded-lg outline-none transition-all"
            style={{ backgroundColor: textColor + "1A", border: "1px solid " + textColor + "30", color: textColor }}
            onFocus={(e) => { e.currentTarget.style.borderColor = primaryColor; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = textColor + "30"; }}
          />
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isAtLimit(selectedType)}
          className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
