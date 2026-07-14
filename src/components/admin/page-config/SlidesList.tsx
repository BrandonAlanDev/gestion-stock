// src/components/admin/page-config/SlidesList.tsx
"use client";

import { useState } from "react";
import { CarouselType } from "../../../../generated/prisma"
import { getCarouselSlides, deleteCarouselSlide, reorderCarouselSlides } from "@/actions/page-config/carousel-slides.actions";
import SlideEditor from "./SlideEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

type Slide = Awaited<ReturnType<typeof getCarouselSlides>>[number];

interface Props {
  slides: Slide[];
  carouselType: CarouselType;
  onSlidesChange: () => void;
}

export default function SlidesList({ slides, carouselType, onSlidesChange }: Props) {
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta diapositiva?")) return;
    const res = await deleteCarouselSlide(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Diapositiva eliminada");
      onSlidesChange();
    }
  };

  const moveUp = async (index: number) => {
    if (index <= 0) return;
    const newOrder = [...slides];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    const ids = newOrder.map((s) => s.id);
    const res = await reorderCarouselSlides(ids);
    if (res.error) toast.error(res.error);
    else onSlidesChange();
  };

  const moveDown = async (index: number) => {
    if (index >= slides.length - 1) return;
    const newOrder = [...slides];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const ids = newOrder.map((s) => s.id);
    const res = await reorderCarouselSlides(ids);
    if (res.error) toast.error(res.error);
    else onSlidesChange();
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setShowEditor(true);
  };

  const handleAdd = () => {
    setEditingSlide(null);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingSlide(null);
    onSlidesChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-white">Diapositivas ({slides.length})</h4>
        <Button onClick={handleAdd} variant="celeste">
          Agregar diapositiva
        </Button>
      </div>

      {slides.length === 0 && (
        <p className="text-neutral-500">No hay diapositivas aún.</p>
      )}

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className="flex items-center gap-4 p-3 bg-neutral-900 rounded-lg border border-neutral-800"
        >
          {slide.image && (
            <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
              <Image src={slide.image} alt={slide.title || ""} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{slide.title || "Sin título"}</p>
            <p className="text-sm text-neutral-400 truncate">{slide.subtitle || slide.text}</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30">▲</button>
            <button onClick={() => moveDown(index)} disabled={index === slides.length - 1} className="p-1 text-neutral-400 hover:text-white disabled:opacity-30">▼</button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(slide)}>Editar</Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(slide.id)}>Eliminar</Button>
        </div>
      ))}

      {showEditor && (
        <SlideEditor
          slide={editingSlide}
          carouselType={carouselType}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}