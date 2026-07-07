// src/components/admin/page-config/CarouselTypeSelector.tsx
"use client";

import { CarouselType } from "../../../../generated/prisma"

const typeDescriptions: Record<CarouselType, string> = {
  HERO_SIMPLE: "Solo imagen",
  HERO_TITULO: "Imagen + título",
  HERO_TEXTO: "Imagen + título + texto",
  HERO_LINK: "Imagen + título + texto + enlace",
};

interface Props {
  value: CarouselType;
  onChange: (type: CarouselType) => void;
}

export default function CarouselTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-2">
        Tipo de carrusel
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CarouselType)}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
      >
        {Object.values(CarouselType).map((type) => (
          <option key={type} value={type}>
            {typeDescriptions[type]}
          </option>
        ))}
      </select>
    </div>
  );
}