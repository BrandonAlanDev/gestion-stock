"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselNavigationProps {
  onPrev: () => void;
  onNext: () => void;
}

export default function CarouselNavigation({ onPrev, onNext }: CarouselNavigationProps) {
  return (
    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-2">
      <button
        type="button"
        onClick={onPrev}
        className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm border cursor-pointer"
        style={{ backgroundColor: "var(--color-secundario)", borderColor: "color-mix(in srgb, var(--color-primario) 25%, transparent)", color: "var(--texto-sobre-secundario)" }}
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm border cursor-pointer"
        style={{ backgroundColor: "var(--color-secundario)", borderColor: "color-mix(in srgb, var(--color-primario) 25%, transparent)", color: "var(--texto-sobre-secundario)" }}
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
}
