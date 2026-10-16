"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save, AlertTriangle } from "lucide-react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

const TYPE_LABELS: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};
import CarouselWizardStep1 from "./CarouselWizardStep1";
import CarouselWizardStep2 from "./CarouselWizardStep2";
import CarouselWizardStep3 from "./CarouselWizardStep3";
import SlideEditor from "./SlideEditor";
import type { SlideFormData } from "./SlideEditor";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";
import type { CarouselWizardData, SlideWizardData, CarouselType } from "@/types/carousel";

interface CarouselWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CarouselWizardData) => Promise<void>;
  initialData?: CarouselWizardData | null;
}

const STEP_TITLES = ["1. Tipo", "2. Configuración", "3. Imágenes"];

const DEFAULT_WIZARD_DATA: CarouselWizardData = {
  type: "HERO",
  title: "",
  settings: {
    heroStyle: "DEFAULT",
    slideLayout: "standard",
    transitionDuration: 6000,
    autoPlay: true,
    showDots: true,
    showNavButtons: true,
    overlayOpacity: 0.9,
    height: 300,
    layout: "simple",
    columns: "md:grid-cols-2",
    cardHeight: "50vh",
    showSubtitle: true,
    enableHoverZoom: true,
  },
  slides: [],
};

export default function CarouselWizard({ isOpen, onClose, onSave, initialData }: CarouselWizardProps) {
  const { nivel, zIndice } = useCapa();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSlide, setEditingSlide] = useState<SlideWizardData | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const data = initialData;
      const slidesData = data.slides || [];
      setWizardData({
        id: data.id,
        type: data.type,
        title: data.title || "",
        settings: data.settings || {},
        slides: slidesData.map((s, i) => ({
          id: s.id,
          image: s.image || "",
          title: s.title || "",
          subtitle: s.subtitle || "",
          description: s.description || "",
          ctaText: s.ctaText || "",
          url: s.url || "",
          linkType: s.linkType || (typeof s.config?.linkType === "string" ? s.config.linkType : "NONE"),
          order: s.order ?? i,
          isNew: false,
        })),
      });
      setStep(3);
    } else {
      setStep(1);
      setWizardData(DEFAULT_WIZARD_DATA);
    }
  }, [isOpen, initialData]);

  const [wizardData, setWizardData] = useState<CarouselWizardData>(DEFAULT_WIZARD_DATA);

  const handleStep1Complete = useCallback((data: { type: CarouselType; title: string; heroStyle?: "DEFAULT" | "SHOWCASE" }) => {
    setWizardData((prev) => ({
      ...prev,
      type: data.type,
      title: data.title,
      settings: {
        ...prev.settings,
        heroStyle: data.heroStyle || "DEFAULT",
        ...(data.type === "HERO" && data.heroStyle !== "SHOWCASE" && { slideLayout: "standard" }),
        ...(data.type === "CARDS" && { layout: "simple" }),
      },
    }));
    setStep(2);
  }, []);

  const handleStep2Complete = useCallback((settings: CarouselWizardData["settings"]) => {
    setWizardData((prev) => ({ ...prev, settings }));
    setStep(3);
  }, []);

  const handleSlideDelete = useCallback((slideId: string) => {
    setWizardData((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== slideId).map((s, i) => ({ ...s, order: i })),
    }));
  }, []);

  const handleSlidesReorder = useCallback((slides: SlideWizardData[]) => {
    setWizardData((prev) => ({ ...prev, slides: slides.map((s, i) => ({ ...s, order: i })) }));
  }, []);

  const handleSlideEditorSave = async (data: SlideFormData): Promise<void> => {
    const slide = editingSlide;
    if (!slide) return;

    setWizardData((prev) => {
      if (slide.isNew) {
        return {
          ...prev,
          slides: [...prev.slides, { ...slide, ...data, isNew: false }],
        };
      }
      return {
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === slide.id ? { ...s, ...data } : s
        ),
      };
    });
    setEditingSlide(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    if (wizardData.slides.length === 0) {
      setError("Debe agregar al menos una imagen");
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(wizardData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setStep(1);
      setWizardData(DEFAULT_WIZARD_DATA);
      setEditingSlide(null);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" style={{ zIndex: zIndice }}>
        <div
          className={cn(
            "max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] text-[var(--admin-texto)] shadow-2xl"
          )}
      >
        <div className="flex items-center justify-between border-b border-[var(--admin-borde)] p-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <h2 className="min-w-0 truncate text-xl font-bold text-[var(--admin-texto)]">
              {initialData ? "Editar" : "Nueva"} sección
              <span className="hidden rounded-full bg-[var(--admin-primario)]/15 px-2 py-0.5 text-xs font-medium text-[var(--admin-primario)] sm:inline">
                {TYPE_LABELS[wizardData.type] || wizardData.type}
              </span>
            </h2>
            <div className="hidden md:flex items-center gap-1">
              {STEP_TITLES.map((title, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      i + 1 <= step
                        ? "bg-[var(--admin-primario)]/15 text-[var(--admin-primario)]"
                        : "bg-[var(--admin-fondo-suave)] text-[var(--admin-texto-suave)]"
                    )}
                  >
                    {i + 1}
                  </span>
                  {i < STEP_TITLES.length - 1 && (
                    <span className={cn("h-0.5 w-8 transition-colors", i + 1 < step ? "bg-[var(--admin-primario)]" : "bg-[var(--admin-borde)]")} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 rounded-lg p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-4 space-y-6">
          {step === 1 && (
            <CarouselWizardStep1
              initialType={initialData?.type}
              initialTitle={initialData?.title}
              initialHeroStyle={initialData?.settings?.heroStyle}
              onComplete={handleStep1Complete}
            />
          )}

          {step === 2 && (
            <CarouselWizardStep2
              type={wizardData.type}
              heroStyle={wizardData.settings?.heroStyle || "DEFAULT"}
              initialSettings={wizardData.settings}
              onComplete={handleStep2Complete}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <CarouselWizardStep3
              type={wizardData.type}
              slides={wizardData.slides}
              onSlideEdit={(slide) => setEditingSlide(slide)}
              onSlideDelete={handleSlideDelete}
              onSlidesReorder={handleSlidesReorder}
              onBack={() => setStep(2)}
            />
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--admin-peligro)] bg-[var(--admin-peligro-suave)] p-3 text-sm text-[var(--admin-peligro)]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-[var(--admin-borde)] pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-[var(--admin-borde)] px-4 py-2 font-medium text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 font-black uppercase tracking-wider text-[var(--admin-primario-texto)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "1"; }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initialData ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(
    <ContextoCapas.Provider value={nivel + 1}>
      {modalContent}
      {editingSlide && (
            <SlideEditor
          isOpen={true}
          onClose={() => setEditingSlide(null)}
          onSave={handleSlideEditorSave}
          initialData={editingSlide}
          carouselType={wizardData.type}
        />
      )}
    </ContextoCapas.Provider>,
    document.body
  );
}
