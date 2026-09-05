"use client";

import { Image as ImageIcon } from "lucide-react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

interface ProductImageProps {
  src: string | null;
  alt: string;
  tamano?: number;
}

export default function ProductImage({ src, alt, tamano = 44 }: ProductImageProps) {
  const paleta = useAdminPaleta();

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={tamano}
        height={tamano}
        className="rounded-xl object-cover shrink-0"
        style={{ border: `1px solid ${paleta.borde}` }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl"
      style={{ width: tamano, height: tamano, backgroundColor: paleta.fondoSuave }}
    >
      <ImageIcon size={16} style={{ color: paleta.textoSuave }} />
    </div>
  );
}
