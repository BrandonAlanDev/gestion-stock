"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save } from "lucide-react";
import CarouselWizardStep2 from "./CarouselWizardStep2";
import { updateCarousel } from "@/actions/carousel/carousel.actions";
import { toast } from "sonner";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";
import type { Carousel } from "@/types/carousel";

interface CarouselSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  carousel: Carousel;
  onSave?: (updated: Carousel) => void;
}

export default function CarouselSettingsModal({ isOpen, onClose, carousel, onSave }: CarouselSettingsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Record<string, unknown>>(carousel.settings || {});
  const { nivel, zIndice } = useCapa();

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
          linkType:
            (s.config?.linkType as string) ||
            (s.url?.startsWith("http") ? "EXTERNAL" : "NONE"),
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" style={{ zIndex: zIndice }}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] text-[var(--admin-texto)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4 backdrop-blur">
          <h2 className="min-w-0 flex-1 truncate text-xl font-bold text-[var(--admin-texto)]">
            Editar configuración
            <span className="ml-2 inline-block max-w-[60%] truncate rounded-full bg-[var(--admin-primario-suave)] px-2 py-0.5 align-middle text-xs font-medium text-[var(--admin-primario)]">
              {carousel.title || carousel.type}
            </span>
          </h2>
          <button onClick={onClose} className="shrink-0 cursor-pointer rounded-lg p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]">
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
            hideNav={true}
            hideLayoutPicker={true}
          />
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
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(<ContextoCapas.Provider value={nivel + 1}>{modalContent}</ContextoCapas.Provider>, document.body);
}
