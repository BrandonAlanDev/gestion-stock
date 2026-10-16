"use client";

import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";
import Input from "@/components/admin/page-config/shared/Input";
import Textarea from "@/components/admin/page-config/shared/Textarea";
import type { SlideFormData } from "./SlideEditor";

interface SeccionContenidoSlideProps {
  formData: SlideFormData;
  alCambiar: (campo: string, valor: unknown) => void;
  getCharCount: (campo: keyof SlideFormData) => number;
  isOverLimit: (campo: keyof SlideFormData) => boolean;
  limites: Record<string, number>;
}

export default function SeccionContenidoSlide({
  formData,
  alCambiar,
  getCharCount,
  isOverLimit,
  limites,
}: SeccionContenidoSlideProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-[var(--admin-texto-suave)]">
        Contenido
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--admin-texto)]">
            Título
            <span
              className={cn(
                "font-mono",
                isOverLimit("title") ? "text-[var(--admin-peligro)]" : "text-[var(--admin-texto-suave)]"
              )}
            >
              {getCharCount("title")}/{limites.title}
            </span>
          </label>
          <Input
            value={formData.title}
            onChange={(valor) => alCambiar("title", valor)}
            placeholder="Título principal"
            className={cn(
              isOverLimit("title") && "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
            )}
          />
          {isOverLimit("title") && (
              <p className="text-xs text-[var(--admin-peligro)]">
              Excede el límite de {limites.title} caracteres
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--admin-texto)]">
            Subtítulo
            <span
              className={cn(
                "font-mono",
                isOverLimit("subtitle") ? "text-[var(--admin-peligro)]" : "text-[var(--admin-texto-suave)]"
              )}
            >
              {getCharCount("subtitle")}/{limites.subtitle}
            </span>
          </label>
          <Input
            value={formData.subtitle}
            onChange={(valor) => alCambiar("subtitle", valor)}
            placeholder="Subtítulo opcional"
            className={cn(
              isOverLimit("subtitle") &&
                "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
            )}
          />
          {isOverLimit("subtitle") && (
            <p className="text-xs text-[var(--admin-peligro)]">
              Excede el límite de {limites.subtitle} caracteres
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--admin-texto)]">
          Descripción
          <span
            className={cn(
              "font-mono",
              isOverLimit("description") ? "text-[var(--admin-peligro)]" : "text-[var(--admin-texto-suave)]"
            )}
          >
            {getCharCount("description")}/{limites.description}
          </span>
        </label>
        <Textarea
          value={formData.description}
          onChange={(valor) => alCambiar("description", valor)}
          placeholder="Descripción opcional"
          rows={2}
          className={cn(
            isOverLimit("description") &&
              "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
          )}
        />
        {isOverLimit("description") && (
          <p className="text-xs text-[var(--admin-peligro)]">
            Excede el límite de {limites.description} caracteres
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--admin-texto)]">
          Texto del botón
          <span
            className={cn(
              "font-mono",
              isOverLimit("ctaText") ? "text-[var(--admin-peligro)]" : "text-[var(--admin-texto-suave)]"
            )}
          >
            {getCharCount("ctaText")}/{limites.ctaText}
          </span>
        </label>
        <Input
          value={formData.ctaText}
          onChange={(valor) => alCambiar("ctaText", valor)}
          placeholder="Ej: Ver más, Comprar ahora"
          className={cn(
            isOverLimit("ctaText") && "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
          )}
        />
        {isOverLimit("ctaText") && (
          <p className="text-xs text-[var(--admin-peligro)]">
            Excede el límite de {limites.ctaText} caracteres
          </p>
        )}
      </div>
    </div>
  );
}
