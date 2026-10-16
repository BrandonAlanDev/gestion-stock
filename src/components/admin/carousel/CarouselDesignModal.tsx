"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save } from "lucide-react";
import { updateCarousel } from "@/actions/carousel/carousel.actions";
import { toast } from "sonner";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";
import type { Carousel } from "@/types/carousel";

const TYPE_LABELS: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};

const HERO_STYLES = [
  { id: "DEFAULT" as const, label: "Clásico", desc: "Portada fullscreen con transiciones" },
  { id: "SHOWCASE" as const, label: "Galería", desc: "Galería horizontal con scroll" },
];

const HERO_SLIDE_LAYOUTS = [
  { id: "standard", label: "Estándar", desc: "Imagen completa con texto centrado" },
  { id: "split", label: "Dividido", desc: "Imagen a la izquierda y texto a la derecha" },
  { id: "minimal", label: "Minimalista", desc: "Imagen completa sin oscurecer, texto más sutil" },
];

const CARDS_LAYOUTS = [
  { id: "simple", label: "Simple", desc: "Cuadrícula de tarjetas" },
  { id: "offers", label: "Ofertas", desc: "Carrusel de ofertas con descuento" },
];

interface CarouselDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  carousel: Carousel;
  onSave?: (updated: Carousel) => void;
}

export default function CarouselDesignModal({ isOpen, onClose, carousel, onSave }: CarouselDesignModalProps) {
  const [settings, setSettings] = useState<Record<string, unknown>>(carousel.settings || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { nivel, zIndice } = useCapa();

  const heroStyle = (settings.heroStyle as "DEFAULT" | "SHOWCASE") || "DEFAULT";

  useEffect(() => {
    if (isOpen) {
      setSettings(carousel.settings || {});
    }
  }, [isOpen, carousel.settings]);

  const handleChange = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await updateCarousel({
        id: carousel.id,
        type: carousel.type,
        title: carousel.title || "",
        settings,
        slides: (carousel.slides || []).map((s) => ({
          id: s.id,
          image: s.image,
          title: s.title || "",
          subtitle: s.subtitle || "",
          description: s.description || "",
          ctaText: s.ctaText || "",
          url: s.url || "",
          order: s.order,
          config: s.config || {},
          linkType:
            (s.config?.linkType as string) ||
            (s.url?.startsWith("http") ? "EXTERNAL" : "NONE"),
        })),
      });
      if (res.success && res.data) {
        toast.success("Diseño actualizado");
        if (onSave) onSave(res.data as Carousel);
        onClose();
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar diseño");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const slideLayout = (settings.slideLayout as string) || "standard";
  const cardsLayout = (settings.layout as string) || "simple";

  const renderHeroConfig = () => (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--admin-texto)]">Estilo de portada</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HERO_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => { handleChange("heroStyle", style.id); }}
              className={`relative cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${heroStyle === style.id ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10" : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)]"}`}
            >
              <span className="block text-sm font-bold text-[var(--admin-texto)]">{style.label}</span>
              <span className="block text-xs text-[var(--admin-texto-suave)]">{style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {heroStyle === "DEFAULT" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--admin-texto)]">Diseño visual</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {HERO_SLIDE_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => handleChange("slideLayout", layout.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${slideLayout === layout.id ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10" : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)]"}`}
              >
                <span className="block text-sm font-bold text-[var(--admin-texto)]">{layout.label}</span>
                <span className="block text-xs text-[var(--admin-texto-suave)]">{layout.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderBannerConfig = () => (
    <p className="text-sm text-[var(--admin-texto-suave)]">
      Las franjas publicitarias no tienen opciones de diseño adicionales. Usa el botón Configuración para ajustar la altura.
    </p>
  );

  const renderCardsConfig = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--admin-texto)]">Estilo de tarjetas</label>
      <div className="grid grid-cols-2 gap-2">
        {CARDS_LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => handleChange("layout", layout.id)}
            className={`relative cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${cardsLayout === layout.id ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10" : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)]"}`}
          >
            <span className="block text-sm font-bold text-[var(--admin-texto)]">{layout.label}</span>
            <span className="block text-xs text-[var(--admin-texto-suave)]">{layout.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" style={{ zIndex: zIndice }}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] text-[var(--admin-texto)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4 backdrop-blur">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--admin-texto)]">
            Cambiar diseño
            <span className="rounded-full bg-[var(--admin-primario-suave)] px-2 py-0.5 text-xs font-medium text-[var(--admin-primario)]">
              {TYPE_LABELS[carousel.type] || carousel.type}
            </span>
          </h2>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {carousel.type === "HERO" && renderHeroConfig()}
          {carousel.type === "BANNER" && renderBannerConfig()}
          {carousel.type === "CARDS" && renderCardsConfig()}
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-b-2xl border-t border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-lg border border-[var(--admin-borde)] px-4 py-2 font-medium text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 font-black uppercase tracking-wider text-[var(--admin-primario-texto)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar diseño
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(<ContextoCapas.Provider value={nivel + 1}>{modalContent}</ContextoCapas.Provider>, document.body);
}
