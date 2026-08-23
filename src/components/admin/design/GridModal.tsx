"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import ZonaImagenSeccion from "./modal/ZonaImagenSeccion";
import ContenidoSeccion from "./modal/ContenidoSeccion";
import AparienciaSeccion from "./modal/AparienciaSeccion";
import BotonEnlaceSeccion from "./modal/BotonEnlaceSeccion";
import { FORMULARIO_VACIO, LIMITES_TARJETA, type DatosTarjeta, type SelectorCategoria, type SelectorProducto } from "./modal/tipos";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";

export type { DatosTarjeta, SelectorCategoria, SelectorProducto } from "./modal/tipos";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DatosTarjeta) => void;
  initialData: DatosTarjeta | null;
  categorias: SelectorCategoria[];
  productos: SelectorProducto[];
  relacionAspecto?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function GridModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categorias,
  productos,
  relacionAspecto = 16 / 10,
  primaryColor: primaryProp,
  secondaryColor: secondaryProp,
}: Props) {
  const { nivel, zIndice } = useCapa();
  const { pageConfig } = usePageConfig();
  const configNido = (pageConfig?.pageConfig ?? pageConfig) as Record<string, unknown> | undefined;
  const primaryColor = primaryProp || (configNido?.primaryColor as string) || "#06b6d4";
  const secondaryColor = secondaryProp || (configNido?.secondaryColor as string) || "#ffffff";
  const textColor = getContrastColor(secondaryColor);

  const [formData, setFormData] = useState<DatosTarjeta>(FORMULARIO_VACIO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentosError, setIntentosError] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [recorteAbierto, setRecorteAbierto] = useState(false);
  const [aparienciaAbierta, setAparienciaAbierta] = useState(false);
  const [botonesAbiertos, setBotonesAbiertos] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...FORMULARIO_VACIO, ...initialData } : FORMULARIO_VACIO);
      setAparienciaAbierta(false);
      setBotonesAbiertos(false);
      setError(null);
      setIsSubmitting(false);
      setIntentosError(0);
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

  const actualizar = <K extends keyof DatosTarjeta>(campo: K, valor: DatosTarjeta[K]) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const contar = (campo: "title" | "subtitle") => formData[campo].length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const marcarError = (mensaje: string) => {
      setError(mensaje);
      setIntentosError((prev) => prev + 1);
    };

    if (!formData.image) {
      marcarError("La imagen es obligatoria");
      return;
    }
    if (formData.linkType === "CATEGORY" && !formData.linkValue) {
      marcarError("Seleccioná una categoría de destino");
      return;
    }
    if (formData.linkType === "PRODUCT" && !formData.linkValue) {
      marcarError("Seleccioná un producto de destino");
      return;
    }
    if (formData.linkType === "EXTERNAL") {
      const url = formData.linkValue.trim();
      if (!/^https?:\/\//.test(url)) {
        marcarError("La URL externa debe empezar con http:// o https://");
        return;
      }
    }
    if (contar("title") > LIMITES_TARJETA.title || contar("subtitle") > LIMITES_TARJETA.subtitle) {
      marcarError("El título o el subtítulo superan el límite de caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      onSave({
        ...formData,
        linkType: formData.linkType,
        linkValue: formData.linkValue.trim(),
      });
      onClose();
    } catch {
      marcarError("Error al guardar la tarjeta");
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
        aria-labelledby="titulo-modal-seccion"
        className={cn(
          "w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-oculta rounded-2xl border shadow-2xl",
          isMobile
            ? "fixed bottom-0 left-0 right-0 rounded-t-2xl rounded-b-none h-[90vh] animate-slide-up"
            : "animate-slide-down"
        )}
        style={{ backgroundColor: secondaryColor, color: textColor, borderColor: primaryColor }}
      >
        <div
          className="flex items-center justify-between p-4 sticky top-0 z-10 backdrop-blur rounded-t-2xl"
          style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor }}
        >
          <div>
            <h2 id="titulo-modal-seccion" className="text-xl font-bold" style={{ color: textColor }}>
              {initialData ? "Editar" : "Nueva"} sección
            </h2>
            <p className="text-sm" style={{ color: textColor + "80" }}>
              {initialData
                ? "Modificá el contenido y apariencia de esta sección"
                : "Creá y personalizá el contenido de esta sección"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ZonaImagenSeccion
            datos={formData}
            relacionAspecto={relacionAspecto}
            deshabilitada={isSubmitting}
            alCambiarEditorAbierto={setRecorteAbierto}
            alCambiarImagen={(valor) => actualizar("image", valor)}
            primaryColor={primaryColor}
            textColor={textColor}
          />

          <ContenidoSeccion
            title={formData.title}
            subtitle={formData.subtitle}
            alCambiar={actualizar}
            primaryColor={primaryColor}
            textColor={textColor}
          />

          <AparienciaSeccion
            abierta={aparienciaAbierta}
            alAlternar={() => setAparienciaAbierta(!aparienciaAbierta)}
            subtitleNeon={formData.subtitleNeon}
            subtitleDim={formData.subtitleDim}
            buttonVariant={formData.buttonVariant}
            buttonBgColor={formData.buttonBgColor}
            buttonTextColor={formData.buttonTextColor}
            alCambiar={actualizar}
            primaryColor={primaryColor}
            textColor={textColor}
          />

          <BotonEnlaceSeccion
            abierta={botonesAbiertos}
            alAlternar={() => setBotonesAbiertos(!botonesAbiertos)}
            linkStyle={formData.linkStyle}
            buttonText={formData.buttonText}
            linkType={formData.linkType}
            linkValue={formData.linkValue}
            categorias={categorias}
            productos={productos}
            alCambiar={actualizar}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            textColor={textColor}
          />

          {error && (
            <div
              className="p-3 rounded-lg flex items-center gap-2 text-sm"
              style={{ backgroundColor: primaryColor + "1A", borderColor: primaryColor + "50", color: primaryColor }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div
            className="flex justify-end gap-3 pt-4 sticky bottom-0 backdrop-blur z-10 rounded-b-2xl"
            style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
              style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = textColor + "08";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancelar
            </button>
            <button
              key={intentosError}
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={cn(
                "px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                intentosError > 0 && "animate-shake"
              )}
              style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "1";
              }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(
    <ContextoCapas.Provider value={nivel + 1}>{modalContent}</ContextoCapas.Provider>,
    document.body
  );
}
