"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, AlertTriangle, ChevronLeft } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { getContrastColor } from "@/lib/utils";
import SlideOrdenable from "./SlideOrdenable";

const TYPE_LABELS: Record<string, string> = {
  HERO: "Portada principal",
  BANNER: "Franja publicitaria",
  CARDS: "Tarjetas destacadas",
};
import type { SlideWizardData, CarouselType } from "@/types/carousel";

interface CarouselWizardStep3Props {
  type: CarouselType;
  slides: SlideWizardData[];
  onSlideEdit?: (slide: SlideWizardData) => void;
  onSlideDelete: (slideId: string) => void;
  onSlidesReorder: (slides: SlideWizardData[]) => void;
  onBack: () => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function CarouselWizardStep3({
  type,
  slides,
  onSlideEdit: onSlideEditProp,
  onSlideDelete,
  onSlidesReorder,
  onBack,
  primaryColor,
  secondaryColor,
}: CarouselWizardStep3Props) {
  const textColor = getContrastColor(secondaryColor);
  const [sortableSlides, setSortableSlides] = useState<SlideWizardData[]>([...slides].sort((a, b) => a.order - b.order));
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setSortableSlides([...slides].sort((a, b) => a.order - b.order));
  }, [slides]);

  const handleAddSlide = () => {
    const newSlide: SlideWizardData = {
      id: `temp-${Date.now()}`,
      image: "",
      title: "",
      subtitle: "",
      description: "",
      ctaText: "",
      url: "",
      order: sortableSlides.length,
      isNew: true,
      config: {},
    };
    if (typeof onSlideEditProp === "function") {
      onSlideEditProp(newSlide);
    } else {
      const updated = [...sortableSlides, newSlide];
      setSortableSlides(updated);
      onSlidesReorder(updated);
    }
  };

  const handleDeleteSlide = (slideId: string) => {
    setDeleteConfirm(slideId);
  };

  const confirmDeleteSlide = (slideId: string) => {
    setDeleteConfirm(null);
    onSlideDelete(slideId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortableSlides.findIndex((s) => s.id === active.id);
      const newIndex = sortableSlides.findIndex((s) => s.id === over?.id);

      const newSlides = arrayMove(sortableSlides, oldIndex, newIndex);
      const reordered = newSlides.map((s, i) => ({ ...s, order: i }));
      setSortableSlides(reordered);
      onSlidesReorder(reordered);
    }
  };

  return (
    <div className="space-y-4" style={{ color: textColor }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="min-w-0 text-lg font-semibold flex items-center gap-2" style={{ color: textColor }}>
          Imágenes ({sortableSlides.length})
          <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
            {TYPE_LABELS[type] || type}
          </span>
        </h3>
        <button
          type="button"
          onClick={handleAddSlide}
          className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer" style={{ backgroundColor: primaryColor + "20", borderColor: primaryColor + "40", color: primaryColor }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "30"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor + "20"; }}
        >
          <ImageIcon className="w-4 h-4" /> Agregar imagen
        </button>
      </div>

      {sortableSlides.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: primaryColor + "40", backgroundColor: primaryColor + "10" }}>
          <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor + "80" }} />
          <p className="text-neutral-500" style={{ color: textColor + "80" }}>No hay imágenes todavía</p>
          <p className="text-xs mt-1" style={{ color: textColor + "60" }}>Haz clic en &apos;Agregar imagen&apos; para comenzar</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableSlides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sortableSlides.map((slide) => (
                <SlideOrdenable
                  key={slide.id}
                  slide={slide}
                  onEdit={onSlideEditProp}
                  onDelete={handleDeleteSlide}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex justify-between pt-4 border-t" style={{ borderColor: primaryColor + "40" }}>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer"
          style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = textColor + "0A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: secondaryColor, borderColor: primaryColor, color: textColor }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor + "20" }}>
                <AlertTriangle className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: textColor }}>Eliminar imagen</h3>
            </div>
            <p className="mb-6" style={{ color: textColor + "CC" }}>¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
                style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = textColor + "0A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteSlide(deleteConfirm)}
                className="px-4 py-2 rounded-lg font-medium hover:bg-red-600 cursor-pointer" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
