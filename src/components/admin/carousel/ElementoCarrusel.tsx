"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Settings, Plus } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { getContrastColor } from "@/lib/utils";
import type { Carousel, SlideWizardData } from "@/types/carousel";
import { SortableSlideItem } from "./CarouselWizardStep3";

const ETIQUETAS_TIPO: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};

const ETIQUETAS_LAYOUT: Record<string, string> = {
  standard: "Estándar",
  split: "Dividido",
  minimal: "Minimalista",
  simple: "Simple",
  offers: "Ofertas",
};

interface ElementoCarruselProps {
  carousel: Carousel;
  index: number;
  onEditCarousel: (carousel: Carousel) => void;
  onEditDesign: (carousel: Carousel) => void;
  onDelete: (id: string) => void;
  onAddSlide: (carousel: Carousel) => void;
  onEditSlide: (carousel: Carousel, slide: Record<string, unknown>) => void;
  onDeleteSlide: (carouselId: string, slideId: string) => void;
  onReorderSlides: (carouselId: string, slides: SlideWizardData[]) => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function ElementoCarrusel({
  carousel,
  index,
  onEditCarousel,
  onEditDesign,
  onDelete,
  onAddSlide,
  onEditSlide,
  onDeleteSlide,
  onReorderSlides,
  primaryColor,
  secondaryColor,
}: ElementoCarruselProps) {
  const textColor = getContrastColor(secondaryColor);
  const [expanded, setExpanded] = useState(false);

  const slides = carousel.slides || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const mapToWizardData = (s: typeof slides[number]): SlideWizardData => ({
    id: s.id,
    image: s.image || "",
    title: s.title || "",
    subtitle: s.subtitle || "",
    description: s.description || "",
    ctaText: s.ctaText || "",
    url: s.url || "",
    order: s.order,
    config: s.config || {},
    linkType: (s.config?.linkType as string) || "",
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over?.id);
      const newSlides = arrayMove(slides.map(mapToWizardData), oldIndex, newIndex);
      const reordered = newSlides.map((s, i) => ({ ...s, order: i }));
      onReorderSlides(carousel.id, reordered);
    }
  };

  return (
    <div
      style={{ backgroundColor: textColor + "08", borderColor: primaryColor + "30" }}
      className="rounded-2xl border"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm" style={{ color: textColor + "60" }}>#{index + 1}</span>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + "15" }}>
            <ImageIcon className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold" style={{ color: textColor }}>{carousel.title || ETIQUETAS_TIPO[carousel.type] || carousel.type}</h4>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
                {ETIQUETAS_TIPO[carousel.type] || carousel.type}
              </span>
              {carousel.active && <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: "#22c55e" + "20", color: "#22c55e" }}>Activo</span>}
            </div>
            <p className="text-sm flex items-center gap-2 mt-0.5" style={{ color: textColor + "80" }}>
              {slides.length} imágenes
              {carousel.settings?.height && <span>· {carousel.settings.height}px</span>}
              {carousel.type === "HERO" && carousel.settings?.slideLayout && <span>· {ETIQUETAS_LAYOUT[carousel.settings.slideLayout as string] || carousel.settings.slideLayout}</span>}
              {carousel.type === "CARDS" && carousel.settings?.layout && <span>· {ETIQUETAS_LAYOUT[carousel.settings.layout as string] || carousel.settings.layout}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEditCarousel(carousel); }}
            className="px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: primaryColor + "20", color: primaryColor, border: "1px solid", borderColor: primaryColor + "30" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "35"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "20"; }}
            title="Configuración del carrusel"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: textColor + "80" }}
            title={expanded ? "Colapsar" : "Ver slides"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(carousel.id); }}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: textColor + "80" }}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t" style={{ borderColor: primaryColor + "40" }}>
          <div className="p-4 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEditDesign(carousel); }}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor + "15", color: primaryColor, border: "1px solid", borderColor: primaryColor + "30" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "25"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "15"; }}
            >
              Cambiar diseño
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAddSlide(carousel); }}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer"
              style={{ borderColor: primaryColor + "40", color: primaryColor }}
            >
              <Plus className="w-4 h-4" /> Agregar imagen
            </button>
          </div>

          <div className="px-4 pb-4">
            {slides.length === 0 ? (
              <p className="text-center py-6 text-sm" style={{ color: textColor + "60" }}>
                Este carrusel no tiene slides todavía
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {slides.map((slide) => (
                      <SortableSlideItem
                        key={slide.id}
                        slide={mapToWizardData(slide)}
                        onEdit={() => onEditSlide(carousel, slide as unknown as Record<string, unknown>)}
                        onDelete={(id) => onDeleteSlide(carousel.id, id)}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
