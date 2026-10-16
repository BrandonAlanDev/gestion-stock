"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useOpcionesEnlace } from "./useOpcionesEnlace";
import { normalizarValorEnlace } from "@/lib/enlaces/normalizar-valor-enlace";
import ZonaImagenSlide from "./ZonaImagenSlide";
import SeccionContenidoSlide from "./SeccionContenidoSlide";
import OpcionesAvanzadasSlide from "./OpcionesAvanzadasSlide";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";

interface SlideEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SlideFormData) => Promise<void>;
  initialData?: SlideData;
  carouselType: "HERO" | "BANNER" | "CARDS";
}

export interface SlideData {
  image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  linkType?: string;
  config?: Record<string, unknown>;
}

export interface SlideFormData {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  url: string;
  linkType: string;
  config: Record<string, unknown>;
}

const LIMITS = {
  title: 100,
  subtitle: 150,
  description: 500,
  ctaText: 50,
};

export default function SlideEditor({
  isOpen,
  onClose,
  onSave,
  initialData,
}: SlideEditorProps) {
  const { pageConfig } = usePageConfig();
  const { productos, categorias } = useOpcionesEnlace();
  const { nivel, zIndice } = useCapa();
  const primaryColor = (pageConfig?.primaryColor as string) || "#06b6d4";

  const [formData, setFormData] = useState<SlideFormData>({
    image: "",
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    url: "",
    linkType: "NONE",
    config: {},
  });
  const [showText, setShowText] = useState(true);
  const [hideButton, setHideButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [recorteAbierto, setRecorteAbierto] = useState(false);
  const [avanzadasAbiertas, setAvanzadasAbiertas] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const hideText = !!initialData.config?.hideText;
        setShowText(!hideText);
        setHideButton(!!initialData.config?.hideButton);
        const linkType = initialData.linkType || ((initialData.config as Record<string, unknown> | undefined)?.linkType as string) || (initialData.url?.startsWith("http") ? "EXTERNAL" : "NONE");
        let urlInicial = initialData.url || "";
        if (linkType === "CATEGORY" || linkType === "PRODUCT") {
          urlInicial = normalizarValorEnlace(urlInicial);
        }
        setFormData({
          image: initialData.image || "",
          title: initialData.title || "",
          subtitle: initialData.subtitle || "",
          description: initialData.description || "",
          ctaText: initialData.ctaText || "",
          url: urlInicial,
          linkType,
          config: initialData.config || {},
        });
      } else {
        setShowText(true);
        setHideButton(false);
        setFormData({
          image: "",
          title: "",
          subtitle: "",
          description: "",
          ctaText: "",
          url: "",
          linkType: "NONE",
          config: {},
        });
      }
      setAvanzadasAbiertas(false);
      setError(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !recorteAbierto && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", manejarTecla);
    return () => document.removeEventListener("keydown", manejarTecla);
  }, [isOpen, recorteAbierto, isSubmitting, onClose]);

  const validateUrl = useCallback((url: string) => {
    if (formData.linkType === "EXTERNAL" && url && !url.startsWith("http")) {
      setError("La URL externa debe empezar con http:// o https://");
    } else {
      setError(null);
    }
  }, [formData.linkType]);

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "url" && typeof value === "string") {
      validateUrl(value);
    }
  }, [validateUrl]);

  const getCharCount = (field: keyof SlideFormData) => {
    const valor = formData[field];
    return typeof valor === "string" ? valor.length : 0;
  };

  const isOverLimit = (field: keyof SlideFormData) => {
    return getCharCount(field) > LIMITS[field as keyof typeof LIMITS];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.image) {
      setError("La imagen es obligatoria");
      return;
    }
    if (formData.linkType === "EXTERNAL" && formData.url && !formData.url.startsWith("http")) {
      setError("La URL externa debe empezar con http:// o https://");
      return;
    }

    const cleanConfig = Object.fromEntries(
      Object.entries(formData.config).filter(([, v]) => v !== undefined)
    );
    if (!showText) cleanConfig.hideText = true;
    else delete cleanConfig.hideText;
    if (hideButton) cleanConfig.hideButton = true;
    else delete cleanConfig.hideButton;

    setIsSubmitting(true);
    try {
      await onSave({ ...formData, config: cleanConfig });
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: zIndice }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-slide"
        className={cn(
          "max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] text-[var(--admin-texto)] shadow-2xl",
          isMobile
            ? "fixed bottom-0 left-0 right-0 rounded-t-2xl rounded-b-none h-[90vh] animate-slide-up"
            : "animate-slide-down"
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4 backdrop-blur">
          <h2 id="titulo-modal-slide" className="text-xl font-bold text-[var(--admin-texto)]">
            {initialData ? "Editar" : "Nueva"} imagen
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="cursor-pointer rounded-lg p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[var(--admin-texto)]">
                Imagen <span className="text-[var(--admin-peligro)]">*</span>
              </label>
              <ZonaImagenSlide
                imagen={formData.image}
                alCambiarImagen={(valor) => handleChange("image", valor)}
                deshabilitada={isSubmitting}
                alCambiarEditorAbierto={setRecorteAbierto}
                showText={showText}
                hideButton={hideButton}
                titulo={formData.title}
                subtitulo={formData.subtitle}
                descripcion={formData.description}
                textoBoton={formData.ctaText}
                url={formData.url}
                primaryColor={primaryColor}
              />
            </div>

            <div className="space-y-4">
              <SeccionContenidoSlide
                formData={formData}
                alCambiar={handleChange}
                getCharCount={getCharCount}
                isOverLimit={isOverLimit}
                limites={LIMITS}
              />

              <OpcionesAvanzadasSlide
                abiertas={avanzadasAbiertas}
                alAlternar={() => setAvanzadasAbiertas(!avanzadasAbiertas)}
                formData={formData}
                alCambiar={handleChange}
                productos={productos}
                categorias={categorias}
                showText={showText}
                alCambiarShowText={() => setShowText(!showText)}
                hideButton={hideButton}
                alCambiarHideButton={() => setHideButton(!hideButton)}
              />

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--admin-peligro)] bg-[var(--admin-peligro-suave)] p-3 text-sm text-[var(--admin-peligro)]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-b-2xl border-t border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] pt-4 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-[var(--admin-borde)] px-4 py-2 font-medium text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 font-black uppercase tracking-wider text-[var(--admin-primario-texto)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initialData ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(<ContextoCapas.Provider value={nivel + 1}>{modalContent}</ContextoCapas.Provider>, document.body);
}
