"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Image as ImageIcon, Link, Edit, Trash2 } from "lucide-react";
import type { SlideWizardData } from "@/types/carousel";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";

interface SlideOrdenableProps {
  slide: SlideWizardData;
  onEdit?: (slide: SlideWizardData) => void;
  onDelete: (id: string) => void;
}

export default function SlideOrdenable({
  slide,
  onEdit,
  onDelete,
}: SlideOrdenableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3 text-[var(--admin-texto)] transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-start gap-3 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--admin-texto-suave)]" />

        <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--admin-fondo-hover)] sm:h-16 sm:w-24">
          {slide.image ? (
            <Image src={slide.image} alt="" fill sizes="(min-width: 640px) 96px, 64px" unoptimized={!imagenAdmiteOptimizacion(slide.image)} className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--admin-texto-suave)]">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-[var(--admin-primario-suave)] px-2 py-0.5 text-xs font-medium text-[var(--admin-primario)]">
              #{slide.order + 1}
            </span>
            <h4 className="truncate font-medium text-[var(--admin-texto)]">{slide.title || "Sin título"}</h4>
          </div>
          <p className="truncate text-sm text-[var(--admin-texto-suave)]">{slide.subtitle || slide.description || "Sin descripción"}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--admin-texto-suave)]">
            {slide.ctaText && <span className="flex items-center gap-1"><Link className="h-3 w-3 text-[var(--admin-primario)]" /> {slide.ctaText}</span>}
            {slide.url && <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3 text-[var(--admin-primario)]" /> Enlace configurado</span>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(slide)}
              className="cursor-pointer rounded-lg p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(slide.id)}
            className="cursor-pointer rounded-lg p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-peligro-suave)] hover:text-[var(--admin-peligro)]"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
