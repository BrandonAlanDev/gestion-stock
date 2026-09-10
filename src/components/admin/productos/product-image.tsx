"use client";

import { Image as ImageIcon } from "lucide-react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  tamano?: number;
}

export default function ProductImage({ src, alt, tamano = 44 }: ProductImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={tamano}
        height={tamano}
        className="shrink-0 rounded-xl border border-[var(--admin-borde)] object-cover"
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]"
      style={{ width: tamano, height: tamano }}
    >
      <ImageIcon size={16} className="text-[var(--admin-texto-suave)]" />
    </div>
  );
}
