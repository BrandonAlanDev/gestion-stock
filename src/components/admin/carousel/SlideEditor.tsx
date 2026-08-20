"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save, AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";
import SubidaImagen from "@/components/imagen/SubidaImagen";
import Input from "@/components/admin/page-config/shared/Input";
import Textarea from "@/components/admin/page-config/shared/Textarea";
import LinkTypeSelector from "./LinkTypeSelector";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useOpcionesEnlace } from "./useOpcionesEnlace";
import { normalizarValorEnlace } from "@/helpers/normalizarValorEnlace";

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
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";
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
      setError(null);
    }
  }, [isOpen, initialData]);

  const validateUrl = (url: string) => {
    if (formData.linkType === "EXTERNAL" && url && !url.startsWith("http")) {
      setError("La URL externa debe empezar con http:// o https://");
    } else {
      setError(null);
    }
  };

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl",
          isMobile && "fixed bottom-0 left-0 right-0 rounded-t-2xl rounded-b-none h-[90vh] animate-slide-up"
        )} style={{ backgroundColor: secondaryColor, borderColor: primaryColor }}
      >
        <div className="flex items-center justify-between p-4 sticky top-0 backdrop-blur z-10 rounded-t-2xl" style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor }}>
          <h2 className="text-xl font-bold" style={{ color: textColor }}>
            {initialData ? "Editar" : "Nueva"} imagen
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors cursor-pointer" style={{ color: textColor + "99" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "1A"; e.currentTarget.style.color = primaryColor; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "99"; }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Imagen <span className="text-red-400">*</span></label>
              <SubidaImagen
                valor={formData.image}
                alCambiar={(valor) => handleChange("image", valor)}
                relacionAspecto={16 / 9}
                tamanoMaximoMb={5}
                obligatoria
                etiqueta="Imagen de portada"
                textoAyuda="PNG, JPG, WebP"
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center justify-between text-sm font-medium" style={{ color: textColor + "CC" }}>
                Título <span className={cn("font-mono", isOverLimit("title") ? "text-red-400" : "")} style={{ color: textColor + "80" }}>
                  {getCharCount("title")}/{LIMITS.title}
                </span>
              </label>
              <Input
                value={formData.title}
                onChange={(value) => handleChange("title", value)}
                placeholder="Título principal"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                className={cn(isOverLimit("title") && "border-red-500/50 focus:border-red-500")}
              />
              {isOverLimit("title") && <p className="text-xs text-red-400">Excede el límite de {LIMITS.title} caracteres</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="flex items-center justify-between text-sm font-medium" style={{ color: textColor + "CC" }}>
                Subtítulo <span className={cn("font-mono", isOverLimit("subtitle") ? "text-red-400" : "")} style={{ color: textColor + "80" }}>
                  {getCharCount("subtitle")}/{LIMITS.subtitle}
                </span>
              </label>
              <Input
                value={formData.subtitle}
                onChange={(value) => handleChange("subtitle", value)}
                placeholder="Subtítulo opcional"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                className={cn(isOverLimit("subtitle") && "border-red-500/50 focus:border-red-500")}
              />
              {isOverLimit("subtitle") && <p className="text-xs text-red-400">Excede el límite de {LIMITS.subtitle} caracteres</p>}
            </div>
            <div className="space-y-1">
              <label className="flex items-center justify-between text-sm font-medium" style={{ color: textColor + "CC" }}>
                Texto del botón <span className={cn("font-mono", isOverLimit("ctaText") ? "text-red-400" : "")} style={{ color: textColor + "80" }}>
                  {getCharCount("ctaText")}/{LIMITS.ctaText}
                </span>
              </label>
              <Input
                value={formData.ctaText}
                onChange={(value) => handleChange("ctaText", value)}
                placeholder="Ej: Ver más, Comprar ahora"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                className={cn(isOverLimit("ctaText") && "border-red-500/50 focus:border-red-500")}
              />
              {isOverLimit("ctaText") && <p className="text-xs text-red-400">Excede el límite de {LIMITS.ctaText} caracteres</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center justify-between text-sm font-medium" style={{ color: textColor + "CC" }}>
              Descripción <span className={cn("font-mono", isOverLimit("description") ? "text-red-400" : "")} style={{ color: textColor + "80" }}>
                {getCharCount("description")}/{LIMITS.description}
              </span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(value) => handleChange("description", value)}
              placeholder="Descripción opcional"
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              rows={2}
              className={cn(isOverLimit("description") && "border-red-500/50 focus:border-red-500")}
            />
            {isOverLimit("description") && <p className="text-xs text-red-400">Excede el límite de {LIMITS.description} caracteres</p>}
          </div>

          <LinkTypeSelector
            linkType={formData.linkType}
            url={formData.url}
            onChange={handleChange}
            products={productos}
            categories={categorias}
            primaryColor={primaryColor}
            textColor={textColor}
            secondaryColor={secondaryColor}
          />

          <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: primaryColor + "30", backgroundColor: primaryColor + "08" }}>
            <span className="text-sm font-medium" style={{ color: textColor + "CC" }}>Mostrar texto sobre la imagen</span>
            <button
              type="button"
              onClick={() => setShowText(!showText)}
              className="relative w-14 h-7 rounded-full transition-colors cursor-pointer"
              style={{ backgroundColor: showText ? primaryColor : textColor + "40" }}
            >
              <div className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform flex items-center justify-center"
                style={{ left: showText ? "calc(100% - 24px)" : "4px" }}>
                {showText ? <Eye className="w-3 h-3" style={{ color: primaryColor }} /> : <EyeOff className="w-3 h-3" style={{ color: textColor + "80" }} />}
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: primaryColor + "30", backgroundColor: primaryColor + "08" }}>
            <div>
              <span className="text-sm font-medium" style={{ color: textColor + "CC" }}>Ocultar botón</span>
              <p className="text-xs" style={{ color: textColor + "80" }}>Muestra el slide sin botón de acción</p>
            </div>
            <button
              type="button"
              onClick={() => setHideButton(!hideButton)}
              className="relative w-14 h-7 rounded-full transition-colors cursor-pointer"
              style={{ backgroundColor: hideButton ? primaryColor : textColor + "40" }}
            >
              <div className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform flex items-center justify-center"
                style={{ left: hideButton ? "calc(100% - 24px)" : "4px" }}>
                {hideButton ? <EyeOff className="w-3 h-3" style={{ color: primaryColor }} /> : <Eye className="w-3 h-3" style={{ color: textColor + "80" }} />}
              </div>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: primaryColor + "1A", borderColor: primaryColor + "50", color: primaryColor }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 backdrop-blur z-10 rounded-b-2xl" style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
              style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = textColor + "0A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
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

  return createPortal(modalContent, document.body);
}