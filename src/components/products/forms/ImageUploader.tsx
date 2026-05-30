"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-utils";
import { X } from "lucide-react";

export interface PendingImage {
  // Imagen ya existente en el servidor
  url?: string;
  publicId?: string;
  // Imagen nueva (archivo local)
  file?: File;
  preview?: string; // objectURL para mostrar en el preview
}

interface ImageUploaderProps {
  images: PendingImage[];
  onAddImages: (newImages: PendingImage[]) => void;
  onRemoveImage: (index: number) => void;
}

export default function ImageUploader({ images, onAddImages, onRemoveImage }: ImageUploaderProps) {
  const [uploading] = useState(false); // lo dejamos para el spinner del submit global
  const inputRef = useRef<HTMLInputElement>(null);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (images.length + files.length > 4) {
      toast.error("Máximo 4 imágenes.");
      return;
    }

    const nuevas: PendingImage[] = [];
    for (const file of files) {
      try {
        const compressed = await compressImage(file, 1200, 1200, 0.8);
        nuevas.push({
          file: compressed,
          preview: URL.createObjectURL(compressed),
        });
      } catch (err) {
        toast.error(`Error al comprimir ${file.name}`);
      }
    }

    if (nuevas.length > 0) {
      onAddImages(nuevas);
    }

    // Limpiar input para permitir re-seleccionar
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const img = images[index];
    // Revocar objectURL si es una imagen nueva
    if (img.preview && !img.url) {
      URL.revokeObjectURL(img.preview);
    }
    onRemoveImage(index);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between pb-2" style={{ borderBottom: "1px solid #b2dede" }}>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#4a7c80" }}>
          Imágenes (Máx. 4)
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full p-3 outline-none"
        style={{
          background: "#f0fafa",
          border: "1px solid #b2dede",
          borderRadius: "12px",
          color: "#0d2b2e",
          fontSize: "14px",
        }}
      />
      {uploading && (
        <p className="text-xs text-[#4a7c80] flex items-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-[#4a7c80] border-t-transparent rounded-full animate-spin" />
          Subiendo...
        </p>
      )}
      <div className="flex gap-4 flex-wrap">
        {images.map((img, idx) => {
          const src = img.url || img.preview || "";
          return (
            <div
              key={img.preview || img.url || idx}
              className="relative w-24 h-24 overflow-hidden group"
              style={{ border: "1px solid #b2dede", borderRadius: "12px" }}
            >
              <Image
                src={src}
                alt={`Preview ${idx}`}
                fill
                className="object-cover"
                onError={() => toast.error(`No se pudo cargar la imagen ${idx + 1}`)}
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "#e05050" }}
              >
                <X size={12} style={{ color: "#fff" }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}