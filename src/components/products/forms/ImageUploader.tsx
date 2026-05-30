"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { X } from "lucide-react";
import { uploadProductImage } from "@/actions/upload-product-image";

interface ImageType {
  url: string;
  publicId?: string;
}

interface ImageUploaderProps {
  images: ImageType[];
  onAddImages: (newImages: ImageType[]) => void;
  onRemoveImage: (index: number) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ images, onAddImages, onRemoveImage }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (images.length + files.length > 4) {
      toast.error("Máximo 4 imágenes.");
      return;
    }

    setUploading(true);
    try {
      const uploadedImages: ImageType[] = [];

      for (const file of files) {
        // Validar tipo y tamaño también en el cliente (buena práctica)
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} supera los 5 MB`);
          continue;
        }

        const base64 = await fileToBase64(file);
        const result = await uploadProductImage(base64);
        uploadedImages.push({ url: result.url, publicId: result.publicId });
      }

      if (uploadedImages.length > 0) {
        onAddImages(uploadedImages);
        toast.success(`${uploadedImages.length} imagen(es) subida(s)`);
      }
    } catch (error: any) {
      console.error("Error al subir imágenes:", error);
      toast.error(error.message || "Error al subir imágenes");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between pb-2" style={{ borderBottom: "1px solid #b2dede" }}>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#4a7c80" }}>
          Imágenes (Máx. 4)
        </span>
      </div>
      <input
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
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-24 h-24 overflow-hidden group"
            style={{ border: "1px solid #b2dede", borderRadius: "12px" }}
          >
            <Image
              src={img.url}
              alt={`Preview ${idx}`}
              fill
              className="object-cover"
              onError={() => toast.error(`No se pudo cargar la imagen ${idx + 1}`)}
            />
            <button
              type="button"
              onClick={() => onRemoveImage(idx)}
              className="absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "#e05050" }}
            >
              <X size={12} style={{ color: "#fff" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}