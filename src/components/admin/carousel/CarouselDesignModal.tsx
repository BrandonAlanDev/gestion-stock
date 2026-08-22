"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save } from "lucide-react";
import { getContrastColor } from "@/lib/utils";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
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
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";
  const textColor = getContrastColor(secondaryColor);

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
        <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Estilo de portada</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HERO_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => { handleChange("heroStyle", style.id); }}
              className="relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
              style={{
                borderColor: heroStyle === style.id ? primaryColor : textColor + "30",
                backgroundColor: heroStyle === style.id ? primaryColor + "15" : "transparent",
              }}
            >
              <span className="font-bold block text-sm" style={{ color: textColor }}>{style.label}</span>
              <span className="text-xs block" style={{ color: textColor + "80" }}>{style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {heroStyle === "DEFAULT" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Diseño visual</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {HERO_SLIDE_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => handleChange("slideLayout", layout.id)}
                className="relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
                style={{
                  borderColor: slideLayout === layout.id ? primaryColor : textColor + "30",
                  backgroundColor: slideLayout === layout.id ? primaryColor + "15" : "transparent",
                }}
              >
                <span className="font-bold block text-sm" style={{ color: textColor }}>{layout.label}</span>
                <span className="text-xs block" style={{ color: textColor + "80" }}>{layout.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderBannerConfig = () => (
    <p className="text-sm" style={{ color: textColor + "80" }}>
      Las franjas publicitarias no tienen opciones de diseño adicionales. Usa el botón Configuración para ajustar la altura.
    </p>
  );

  const renderCardsConfig = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Estilo de tarjetas</label>
      <div className="grid grid-cols-2 gap-2">
        {CARDS_LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => handleChange("layout", layout.id)}
            className="relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
            style={{
              borderColor: cardsLayout === layout.id ? primaryColor : textColor + "30",
              backgroundColor: cardsLayout === layout.id ? primaryColor + "15" : "transparent",
            }}
          >
            <span className="font-bold block text-sm" style={{ color: textColor }}>{layout.label}</span>
            <span className="text-xs block" style={{ color: textColor + "80" }}>{layout.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: zIndice }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: secondaryColor, borderColor: primaryColor }}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 backdrop-blur z-10 rounded-t-2xl" style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor + "40" }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: textColor }}>
            Cambiar diseño
            <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
              {TYPE_LABELS[carousel.type] || carousel.type}
            </span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors cursor-pointer" style={{ color: textColor + "99" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "1A"; e.currentTarget.style.color = primaryColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "99"; }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {carousel.type === "HERO" && renderHeroConfig()}
          {carousel.type === "BANNER" && renderBannerConfig()}
          {carousel.type === "CARDS" && renderCardsConfig()}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 backdrop-blur z-10 rounded-b-2xl" style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor + "40" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = textColor + "0A"; }}
            onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "1"; }}
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
