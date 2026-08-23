"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useOpcionesEnlace } from "./useOpcionesEnlace";
import { normalizarValorEnlace } from "@/helpers/normalizarValorEnlace";
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
  const secondaryColor = (pageConfig?.secondaryColor as string) || "#fafafa";
  const textColor = getContrastColor(secondaryColor);

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
          "w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl",
          isMobile
            ? "fixed bottom-0 left-0 right-0 rounded-t-2xl rounded-b-none h-[90vh] animate-slide-up"
            : "animate-slide-down"
        )}
        style={{ backgroundColor: secondaryColor, borderColor: primaryColor }}
      >
        <div className="flex items-center justify-between p-4 sticky top-0 z-10 backdrop-blur rounded-t-2xl" style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor }}>
          <h2 id="titulo-modal-slide" className="text-xl font-bold" style={{ color: textColor }}>
            {initialData ? "Editar" : "Nueva"} imagen
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: textColor + "99" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "1A"; e.currentTarget.style.color = primaryColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "99"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>
                Imagen <span className="text-red-400">*</span>
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
                secondaryColor={secondaryColor}
                textColor={textColor}
              />
            </div>

            <div className="space-y-4">
              <SeccionContenidoSlide
                formData={formData}
                alCambiar={handleChange}
                getCharCount={getCharCount}
                isOverLimit={isOverLimit}
                limites={LIMITS}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                textColor={textColor}
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
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                textColor={textColor}
              />

              {error && (
                <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: primaryColor + "1A", borderColor: primaryColor + "50", color: primaryColor }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 z-10 backdrop-blur rounded-b-2xl" style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
              style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = textColor + "08"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
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

  return createPortal(<ContextoCapas.Provider value={nivel + 1}>{modalContent}</ContextoCapas.Provider>, document.body);
}
