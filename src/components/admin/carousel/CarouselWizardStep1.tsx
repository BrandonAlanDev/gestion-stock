"use client";

import { useState, useEffect } from "react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

const TYPE_LABELS: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};

const TYPES = [
  { id: "HERO" as const, icon: "🖥️", label: "Portada principal", desc: "Carrusel destacado a pantalla completa" },
  { id: "BANNER" as const, icon: "📢", label: "Franja publicitaria", desc: "Franja horizontal rotativa" },
  { id: "CARDS" as const, icon: "🎴", label: "Tarjetas destacadas", desc: "Grilla de tarjetas con imágenes" },
];

const HERO_STYLES = [
  { id: "DEFAULT" as const, label: "Clásico", desc: "Portada fullscreen con transiciones" },
  { id: "SHOWCASE" as const, label: "Galería", desc: "Galería horizontal con scroll" },
];

interface CarouselWizardStep1Props {
  initialType?: "HERO" | "BANNER" | "CARDS";
  initialTitle?: string;
  initialHeroStyle?: "DEFAULT" | "SHOWCASE";
  onComplete: (data: { type: "HERO" | "BANNER" | "CARDS"; title: string; heroStyle?: "DEFAULT" | "SHOWCASE" }) => void;
}

export default function CarouselWizardStep1({
  initialType,
  initialTitle,
  initialHeroStyle,
  onComplete,
}: CarouselWizardStep1Props) {
  const [selectedType, setSelectedType] = useState<"HERO" | "BANNER" | "CARDS">(initialType || "HERO");
  const [heroStyle, setHeroStyle] = useState<"DEFAULT" | "SHOWCASE">(initialHeroStyle || "DEFAULT");
  const [title, setTitle] = useState(initialTitle || "");
  const [limits, setLimits] = useState({ HERO: 10, BANNER: 10, CARDS: 10 });
  const [currentCounts, setCurrentCounts] = useState({ HERO: 0, BANNER: 0, CARDS: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/carousels?admin=true");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLimits(data.limits || { HERO: 10, BANNER: 10, CARDS: 10 });
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
    onComplete({ type: selectedType, title: title.trim(), heroStyle });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--admin-texto)]">Tipo de sección</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TYPES.map((type) => {
            const atLimit = isAtLimit(type.id);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => { setSelectedType(type.id); setHeroStyle("DEFAULT"); }}
                disabled={atLimit}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50",
                  selectedType === type.id
                    ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10"
                    : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)]"
                )}
              >
                <span className="text-3xl block mb-2">{type.icon}</span>
                <span className="mb-1 block font-bold text-[var(--admin-texto)]">{type.label}</span>
                <span className="mb-2 block text-xs text-[var(--admin-texto-suave)]">{type.desc}</span>

                {atLimit && (
                  <span className="absolute bottom-2 left-2 right-2 rounded bg-[var(--admin-aviso-suave)] px-2 py-1 text-xs text-[var(--admin-aviso)]">
                    Límite alcanzado ({currentCounts[type.id]}/{limits[type.id]})
                  </span>
                )}

                {selectedType === type.id && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--admin-primario)] text-[var(--admin-primario-texto)]">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-2 text-center text-xs text-[var(--admin-texto-suave)] sm:grid-cols-3">
          {(["HERO","BANNER","CARDS"] as const).map((t) => {
            const atLimit = currentCounts[t] >= limits[t];
            return (
              <div key={t} className={cn("rounded px-2 py-1", atLimit ? "bg-[var(--admin-aviso-suave)] text-[var(--admin-aviso)]" : "bg-[var(--admin-fondo-suave)] text-[var(--admin-texto-suave)]")}>
                {TYPE_LABELS[t] || t}: {currentCounts[t]}/{limits[t]}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--admin-texto)]">Estilo de portada</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HERO_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setHeroStyle(style.id)}
              className={cn(
                "relative cursor-pointer rounded-xl border-2 p-3 text-left transition-all",
                heroStyle === style.id
                  ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10"
                  : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)]"
              )}
            >
              <span className="block text-sm font-bold text-[var(--admin-texto)]">{style.label}</span>
              <span className="block text-xs text-[var(--admin-texto-suave)]">{style.desc}</span>
              {heroStyle === style.id && (
                <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--admin-primario)] text-[var(--admin-primario-texto)]">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--admin-texto)]">Título de la sección</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Ofertas de verano, Categorías principales..."
          className="w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2 text-[var(--admin-texto)] outline-none transition-all placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isAtLimit(selectedType)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 font-black uppercase tracking-wider text-[var(--admin-primario-texto)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
