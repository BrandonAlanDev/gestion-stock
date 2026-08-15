"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save } from "lucide-react";
import { getContrastColor } from "@/lib/utils";
import CarouselWizardStep2 from "./CarouselWizardStep2";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { updateCarousel } from "@/actions/carousel/carousel.actions";
import { toast } from "sonner";
import type { Carousel } from "@/types/carousel";

interface CarouselSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  carousel: Carousel;
  onSave?: (updated: Carousel) => void;
}

export default function CarouselSettingsModal({ isOpen, onClose, carousel, onSave }: CarouselSettingsModalProps) {
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";
  const textColor = getContrastColor(secondaryColor);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Record<string, unknown>>(carousel.settings || {});

  useEffect(() => {
    if (isOpen) {
      setSettings(carousel.settings || {});
    }
  }, [isOpen, carousel.settings]);

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
        })),
      });
      if (res.success && res.data) {
        toast.success("Configuración actualizada");
        if (onSave) onSave(res.data as Carousel);
        onClose();
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar configuración");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: secondaryColor, borderColor: primaryColor }}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 backdrop-blur z-10 rounded-t-2xl" style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor + "40" }}>
          <h2 className="min-w-0 flex-1 truncate text-xl font-bold" style={{ color: textColor }}>
            Editar configuración
            <span className="ml-2 inline-block max-w-[60%] truncate px-2 py-0.5 align-middle text-xs font-medium rounded-full" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
              {carousel.title || carousel.type}
            </span>
          </h2>
          <button onClick={onClose} className="shrink-0 p-2 rounded-lg transition-colors cursor-pointer" style={{ color: textColor + "99" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "1A"; e.currentTarget.style.color = primaryColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "99"; }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <CarouselWizardStep2
            type={carousel.type}
            heroStyle={(carousel.settings?.heroStyle as "DEFAULT" | "SHOWCASE") || "DEFAULT"}
            initialSettings={settings}
            onComplete={(newSettings) => setSettings(newSettings)}
            onBack={() => {}}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            hideNav={true}
            hideLayoutPicker={true}
          />
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
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
