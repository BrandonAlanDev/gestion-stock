"use client";

import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";

interface ImagenProductoProps {
  src: string | null;
  alt: string;
  tamano?: number;
}

export default function ImagenProducto({ src, alt, tamano = 44 }: ImagenProductoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={tamano}
        height={tamano}
        unoptimized={!imagenAdmiteOptimizacion(src)}
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
