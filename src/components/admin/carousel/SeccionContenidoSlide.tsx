"use client";

import { cn } from "@/lib/utils";
import Input from "@/components/admin/page-config/shared/Input";
import Textarea from "@/components/admin/page-config/shared/Textarea";
import type { SlideFormData } from "./SlideEditor";

interface SeccionContenidoSlideProps {
  formData: SlideFormData;
  alCambiar: (campo: string, valor: unknown) => void;
  getCharCount: (campo: keyof SlideFormData) => number;
  isOverLimit: (campo: keyof SlideFormData) => boolean;
  limites: Record<string, number>;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export default function SeccionContenidoSlide({
  formData,
  alCambiar,
  getCharCount,
  isOverLimit,
  limites,
  primaryColor,
  secondaryColor,
  textColor,
}: SeccionContenidoSlideProps) {
  return (
    <div className="space-y-4">
      <h3
        className="text-xs font-black uppercase tracking-widest"
        style={{ color: textColor + "99" }}
      >
        Contenido
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            className="flex items-center justify-between gap-2 text-sm font-medium"
            style={{ color: textColor + "CC" }}
          >
            Título
            <span
              className={cn(
                "font-mono",
                isOverLimit("title") ? "text-red-400" : ""
              )}
              style={{ color: textColor + "80" }}
            >
              {getCharCount("title")}/{limites.title}
            </span>
          </label>
          <Input
            value={formData.title}
            onChange={(valor) => alCambiar("title", valor)}
            placeholder="Título principal"
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            className={cn(
              isOverLimit("title") && "border-red-500/50 focus:border-red-500"
            )}
          />
          {isOverLimit("title") && (
            <p className="text-xs text-red-400">
              Excede el límite de {limites.title} caracteres
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            className="flex items-center justify-between gap-2 text-sm font-medium"
            style={{ color: textColor + "CC" }}
          >
            Subtítulo
            <span
              className={cn(
                "font-mono",
                isOverLimit("subtitle") ? "text-red-400" : ""
              )}
              style={{ color: textColor + "80" }}
            >
              {getCharCount("subtitle")}/{limites.subtitle}
            </span>
          </label>
          <Input
            value={formData.subtitle}
            onChange={(valor) => alCambiar("subtitle", valor)}
            placeholder="Subtítulo opcional"
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            className={cn(
              isOverLimit("subtitle") &&
                "border-red-500/50 focus:border-red-500"
            )}
          />
          {isOverLimit("subtitle") && (
            <p className="text-xs text-red-400">
              Excede el límite de {limites.subtitle} caracteres
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="flex items-center justify-between gap-2 text-sm font-medium"
          style={{ color: textColor + "CC" }}
        >
          Descripción
          <span
            className={cn(
              "font-mono",
              isOverLimit("description") ? "text-red-400" : ""
            )}
            style={{ color: textColor + "80" }}
          >
            {getCharCount("description")}/{limites.description}
          </span>
        </label>
        <Textarea
          value={formData.description}
          onChange={(valor) => alCambiar("description", valor)}
          placeholder="Descripción opcional"
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          rows={2}
          className={cn(
            isOverLimit("description") &&
              "border-red-500/50 focus:border-red-500"
          )}
        />
        {isOverLimit("description") && (
          <p className="text-xs text-red-400">
            Excede el límite de {limites.description} caracteres
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label
          className="flex items-center justify-between gap-2 text-sm font-medium"
          style={{ color: textColor + "CC" }}
        >
          Texto del botón
          <span
            className={cn(
              "font-mono",
              isOverLimit("ctaText") ? "text-red-400" : ""
            )}
            style={{ color: textColor + "80" }}
          >
            {getCharCount("ctaText")}/{limites.ctaText}
          </span>
        </label>
        <Input
          value={formData.ctaText}
          onChange={(valor) => alCambiar("ctaText", valor)}
          placeholder="Ej: Ver más, Comprar ahora"
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          className={cn(
            isOverLimit("ctaText") && "border-red-500/50 focus:border-red-500"
          )}
        />
        {isOverLimit("ctaText") && (
          <p className="text-xs text-red-400">
            Excede el límite de {limites.ctaText} caracteres
          </p>
        )}
      </div>
    </div>
  );
}
