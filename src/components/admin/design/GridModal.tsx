"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";
import SubidaImagen from "@/components/imagen/SubidaImagen";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import SelectorDestino from "./modal/SelectorDestino";
import ControlesEnlace from "./modal/ControlesEnlace";
import { FORMULARIO_VACIO, LIMITES_TARJETA, type DatosTarjeta, type SelectorCategoria } from "./modal/tipos";

export type { DatosTarjeta, SelectorCategoria } from "./modal/tipos";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DatosTarjeta) => void;
  initialData: DatosTarjeta | null;
  categorias: SelectorCategoria[];
  relacionAspecto?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

function Interruptor({
  activo,
  etiqueta,
  alCambiar,
  colorPrimario,
  colorTexto,
}: {
  activo: boolean;
  etiqueta: string;
  alCambiar: () => void;
  colorPrimario: string;
  colorTexto: string;
}) {
  return (
    <button
      type="button"
      onClick={alCambiar}
      aria-label={etiqueta}
      role="switch"
      aria-checked={activo}
      className="relative w-12 h-6 rounded-full transition-colors cursor-pointer"
      style={{ backgroundColor: activo ? colorPrimario : colorTexto + "33" }}
    >
      <div
        className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm"
        style={{ left: activo ? "calc(100% - 20px)" : "4px" }}
      />
    </button>
  );
}

export default function GridModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categorias,
  relacionAspecto = 16 / 10,
  primaryColor: primaryProp,
  secondaryColor: secondaryProp,
}: Props) {
  const { pageConfig } = usePageConfig();
  const configNido = (pageConfig?.pageConfig ?? pageConfig) as Record<string, unknown> | undefined;
  const primaryColor = primaryProp || (configNido?.primaryColor as string) || "#06b6d4";
  const secondaryColor = secondaryProp || (configNido?.secondaryColor as string) || "#ffffff";
  const textColor = getContrastColor(secondaryColor);
  const estiloInput: React.CSSProperties = {
    borderColor: textColor + "44",
    color: textColor,
  };

  const [formData, setFormData] = useState<DatosTarjeta>(FORMULARIO_VACIO);
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
      setFormData(initialData ? { ...FORMULARIO_VACIO, ...initialData } : FORMULARIO_VACIO);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const actualizar = <K extends keyof DatosTarjeta>(campo: K, valor: DatosTarjeta[K]) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const contar = (campo: "title" | "subtitle") => formData[campo].length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.image) {
      setError("La imagen es obligatoria");
      return;
    }
    if (formData.linkType === "CATEGORY" && !formData.linkValue) {
      setError("Seleccioná una categoría de destino");
      return;
    }
    if (formData.linkType === "PAGE") {
      const destino = formData.linkValue.trim();
      if (!/^\/(?!\/)/.test(destino)) {
        setError("La página debe comenzar con una sola barra (/)");
        return;
      }
    }
    if (formData.linkType === "EXTERNAL") {
      const url = formData.linkValue.trim();
      if (!/^https?:\/\//.test(url)) {
        setError("La URL externa debe empezar con http:// o https://");
        return;
      }
    }
    if (contar("title") > LIMITES_TARJETA.title || contar("subtitle") > LIMITES_TARJETA.subtitle) {
      setError("El título o el subtítulo superan el límite de caracteres");
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
      setError("Error al guardar la tarjeta");
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
        )}
        style={{ backgroundColor: secondaryColor, color: textColor, borderColor: primaryColor }}
      >
        <div
          className="flex items-center justify-between p-4 sticky top-0 backdrop-blur z-10 rounded-t-2xl"
          style={{ backgroundColor: secondaryColor + "F0", borderColor: primaryColor }}
        >
          <h2 className="text-xl font-black uppercase italic" style={{ color: textColor }}>
            {initialData ? "Editar" : "Nueva"} sección
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: textColor + "99" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div className="space-y-1">
            <label className="flex items-center justify-between text-sm font-medium" style={{ color: textColor + "CC" }}>
              Título
              <span className={cn("font-mono", contar("title") > LIMITES_TARJETA.title ? "text-red-400" : "")} style={{ color: textColor + "80" }}>
                {contar("title")}/{LIMITES_TARJETA.title}
              </span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => actualizar("title", e.target.value)}
              placeholder="Título de la sección"
              className={cn("w-full p-4 border rounded-xl bg-transparent", contar("title") > LIMITES_TARJETA.title && "border-red-500/50")}
              style={estiloInput}
            />
            {contar("title") > LIMITES_TARJETA.title && (
              <p className="text-xs text-red-400">Excede el límite de {LIMITES_TARJETA.title} caracteres</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="flex items-center justify-between text-sm font-medium" style={{ color: textColor + "CC" }}>
              Subtítulo
              <span className={cn("font-mono", contar("subtitle") > LIMITES_TARJETA.subtitle ? "text-red-400" : "")} style={{ color: textColor + "80" }}>
                {contar("subtitle")}/{LIMITES_TARJETA.subtitle}
              </span>
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => actualizar("subtitle", e.target.value)}
              placeholder="Subtítulo opcional"
              className={cn("w-full p-4 border rounded-xl bg-transparent", contar("subtitle") > LIMITES_TARJETA.subtitle && "border-red-500/50")}
              style={estiloInput}
            />
            {contar("subtitle") > LIMITES_TARJETA.subtitle && (
              <p className="text-xs text-red-400">Excede el límite de {LIMITES_TARJETA.subtitle} caracteres</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>
              Imagen <span className="text-red-400">*</span>
            </label>
            <SubidaImagen
              valor={formData.image}
              alCambiar={(valor) => actualizar("image", valor)}
              relacionAspecto={relacionAspecto}
              obligatoria
              etiqueta="Imagen de la sección"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: primaryColor + "30", backgroundColor: primaryColor + "08" }}>
              <span className="text-sm font-medium" style={{ color: textColor + "CC" }}>Subtítulo con efecto neón</span>
              <Interruptor
                activo={formData.subtitleNeon}
                etiqueta="Activar subtítulo con efecto neón"
                alCambiar={() => actualizar("subtitleNeon", !formData.subtitleNeon)}
                colorPrimario={primaryColor}
                colorTexto={textColor}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: primaryColor + "30", backgroundColor: primaryColor + "08" }}>
              <span className="text-sm font-medium" style={{ color: textColor + "CC" }}>Subtítulo opaco (gris)</span>
              <Interruptor
                activo={formData.subtitleDim}
                etiqueta="Activar subtítulo opaco"
                alCambiar={() => actualizar("subtitleDim", !formData.subtitleDim)}
                colorPrimario={primaryColor}
                colorTexto={textColor}
              />
            </div>
          </div>

          <ControlesEnlace
            linkStyle={formData.linkStyle}
            buttonVariant={formData.buttonVariant}
            buttonText={formData.buttonText}
            buttonBgColor={formData.buttonBgColor}
            buttonTextColor={formData.buttonTextColor}
            primaryColor={primaryColor}
            textColor={textColor}
            alCambiar={actualizar}
          />

          <SelectorDestino
            linkType={formData.linkType}
            linkValue={formData.linkValue}
            categorias={categorias}
            secondaryColor={secondaryColor}
            textColor={textColor}
            alCambiar={actualizar}
          />

          {error && (
            <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: primaryColor + "1A", borderColor: primaryColor + "50", color: primaryColor }}>
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
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
