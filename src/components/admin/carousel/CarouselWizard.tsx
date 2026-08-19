"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save, AlertTriangle } from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";

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
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import type { CarouselWizardData, SlideWizardData, CarouselType, CarouselSettings } from "@/types/carousel";

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
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";
  const textColor = getContrastColor(secondaryColor);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSlide, setEditingSlide] = useState<SlideWizardData | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const data = initialData as Record<string, unknown>;
      const slidesData = (data.slides as Array<Record<string, unknown>>) || [];
      setWizardData({
        id: data.id as string,
        type: data.type as CarouselType,
        title: (data.title as string) || "",
        settings: (data.settings as CarouselSettings) || {},
        slides: slidesData.map((s, i) => ({
          id: s.id as string,
          image: (s.image as string) || "",
          title: (s.title as string) || "",
          subtitle: (s.subtitle as string) || "",
          description: (s.description as string) || "",
          ctaText: (s.ctaText as string) || "",
          url: (s.url as string) || "",
          linkType: (s.linkType as string) || ((s.config as Record<string, unknown> | undefined)?.linkType as string) || "NONE",
          order: (s.order as number) ?? i,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className={cn(
            "w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
          )}
          style={{ backgroundColor: secondaryColor, borderColor: primaryColor, color: textColor }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: primaryColor + "40" }}>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <h2 className="min-w-0 truncate text-xl font-bold" style={{ color: textColor }}>
              {initialData ? "Editar" : "Nueva"} sección
              <span className="hidden px-2 py-0.5 text-xs font-medium rounded-full sm:inline" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
                {TYPE_LABELS[wizardData.type] || wizardData.type}
              </span>
            </h2>
            <div className="hidden md:flex items-center gap-1">
              {STEP_TITLES.map((title, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full transition-colors"
                    )}
                    style={{
                      backgroundColor: i + 1 < step ? primaryColor + "20" : i + 1 === step ? primaryColor + "20" : textColor + "1A",
                      color: i + 1 < step ? primaryColor : i + 1 === step ? primaryColor : textColor + "80",
                    }}
                  >
                    {i + 1}
                  </span>
                  {i < STEP_TITLES.length - 1 && (
                    <span className={cn("w-8 h-0.5 transition-colors")} style={{ backgroundColor: i + 1 < step ? primaryColor : textColor + "1A" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: textColor + "99" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "1A"; e.currentTarget.style.color = primaryColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "99"; }}
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
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          )}

          {step === 2 && (
            <CarouselWizardStep2
              type={wizardData.type}
              heroStyle={wizardData.settings?.heroStyle || "DEFAULT"}
              initialSettings={wizardData.settings}
              onComplete={handleStep2Complete}
              onBack={() => setStep(1)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
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
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          )}

          {error && (
            <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: primaryColor + "1A", borderColor: primaryColor + "50", color: primaryColor }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: primaryColor + "40" }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = textColor + "0A"; }}
              onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
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
    <>
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
    </>,
    document.body
  );
}