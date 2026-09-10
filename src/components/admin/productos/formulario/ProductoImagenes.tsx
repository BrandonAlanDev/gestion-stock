"use client";

import ImageUploader from "@/components/providers/products/forms/ImageUploader";
import type { PendingImage } from "@/components/providers/products/forms/ImageUploader";

interface Props {
  images: PendingImage[];
  onAddImages: (imagenes: PendingImage[]) => void;
  onRemoveImage: (indice: number) => void;
  onReorder: (origen: number, destino: number) => void;
  onEdit: (indice: number, preview: string) => void;
}

export default function ProductoImagenes({ images, onAddImages, onRemoveImage, onReorder, onEdit }: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--admin-texto)]">Imágenes</h3>
      <ImageUploader
        images={images}
        onAddImages={onAddImages}
        onRemoveImage={onRemoveImage}
        onReorder={onReorder}
        alEditarImagen={onEdit}
      />
    </section>
  );
}
