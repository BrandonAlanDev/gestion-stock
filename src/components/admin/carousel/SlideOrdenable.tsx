"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getContrastColor } from "@/lib/utils";
import { GripVertical, Image as ImageIcon, Link, Edit, Trash2 } from "lucide-react";
import type { SlideWizardData } from "@/types/carousel";

interface SlideOrdenableProps {
  slide: SlideWizardData;
  onEdit?: (slide: SlideWizardData) => void;
  onDelete: (id: string) => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function SlideOrdenable({
  slide,
  onEdit,
  onDelete,
  primaryColor,
  secondaryColor,
}: SlideOrdenableProps) {
  const textColor = getContrastColor(secondaryColor);
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

  const borderColor = primaryColor + "40";
  const iconColor = textColor + "80";

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: primaryColor + "10", borderColor, color: textColor }}
      className="group relative rounded-xl p-3 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-start gap-3 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: iconColor }} />

        <div className="relative w-16 h-12 sm:w-24 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden" style={{ backgroundColor: primaryColor + "15" }}>
          {slide.image ? (
            <img src={slide.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: iconColor }}>
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
              #{slide.order + 1}
            </span>
            <h4 className="font-medium truncate" style={{ color: textColor }}>{slide.title || "Sin título"}</h4>
          </div>
          <p className="text-sm truncate" style={{ color: textColor + "99" }}>{slide.subtitle || slide.description || "Sin descripción"}</p>
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: textColor + "80" }}>
            {slide.ctaText && <span className="flex items-center gap-1"><Link className="w-3 h-3" style={{ color: primaryColor }} /> {slide.ctaText}</span>}
            {slide.url && <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" style={{ color: primaryColor }} /> Enlace configurado</span>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(slide)}
              className="p-2 rounded-lg transition-colors cursor-pointer" style={{ color: textColor + "80" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "20"; e.currentTarget.style.color = primaryColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "80"; }}
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(slide.id)}
            className="p-2 rounded-lg transition-colors cursor-pointer" style={{ color: textColor + "80" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = textColor + "80"; }}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
