"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, AlertTriangle, ChevronLeft } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SlideOrdenable from "./SlideOrdenable";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";

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
}

export default function CarouselWizardStep3({
  type,
  slides,
  onSlideEdit: onSlideEditProp,
  onSlideDelete,
  onSlidesReorder,
  onBack,
}: CarouselWizardStep3Props) {
  const { nivel, zIndice } = useCapa();
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
    <div className="space-y-4 text-[var(--admin-texto)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 text-lg font-semibold text-[var(--admin-texto)]">
          Imágenes ({sortableSlides.length})
          <span className="rounded-full bg-[var(--admin-primario-suave)] px-2 py-0.5 text-xs font-medium text-[var(--admin-primario)]">
            {TYPE_LABELS[type] || type}
          </span>
        </h3>
        <button
          type="button"
          onClick={handleAddSlide}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--admin-primario-suave)] px-3 py-1.5 text-sm font-medium text-[var(--admin-primario)] transition-colors hover:bg-[var(--admin-primario)]/20"
        >
          <ImageIcon className="w-4 h-4" /> Agregar imagen
        </button>
      </div>

      {sortableSlides.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] py-12 text-center">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-[var(--admin-texto-suave)]" />
          <p className="text-[var(--admin-texto)]">No hay imágenes todavía</p>
          <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">Haz clic en &apos;Agregar imagen&apos; para comenzar</p>
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
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex justify-between border-t border-[var(--admin-borde)] pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--admin-borde)] px-4 py-2 font-medium text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      {deleteConfirm && (
        <ContextoCapas.Provider value={nivel + 1}>
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" style={{ zIndex: zIndice }}>
          <div className="w-full max-w-sm rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-6 text-[var(--admin-texto)] shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-peligro-suave)] text-[var(--admin-peligro)]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--admin-texto)]">Eliminar imagen</h3>
            </div>
            <p className="mb-6 text-[var(--admin-texto-suave)]">¿Estás seguro de que quieres eliminar esta imagen? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="cursor-pointer rounded-lg border border-[var(--admin-borde)] px-4 py-2 font-medium text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteSlide(deleteConfirm)}
                className="cursor-pointer rounded-lg bg-[var(--admin-peligro-accion)] px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
        </ContextoCapas.Provider>
      )}
    </div>
  );
}
