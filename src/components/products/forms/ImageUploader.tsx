"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { X } from "lucide-react";

interface ImageType {
  url: string;
  publicId?: string;
}

interface ImageUploaderProps {
  images: ImageType[];
  onAddImages: (newImages: ImageType[]) => void;
  onRemoveImage: (index: number) => void;
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

    try {
      setUploading(true);
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: data }
          );
          if (!res.ok) throw new Error("Error subiendo imagen");
          const json = await res.json();
          return { url: json.secure_url, publicId: json.public_id };
        })
      );
      onAddImages(uploadedImages);
      toast.success("Imágenes subidas");
    } catch (error) {
      toast.error("Error al subir imágenes");
    } finally {
      setUploading(false);
      // Limpiar input para permitir re-seleccionar el mismo archivo
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
      {uploading && <p className="text-xs text-[#4a7c80]">Subiendo...</p>}
      <div className="flex gap-4 flex-wrap">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-24 h-24 overflow-hidden group"
            style={{ border: "1px solid #b2dede", borderRadius: "12px" }}
          >
            <Image src={img.url} alt={`Preview ${idx}`} fill className="object-cover" />
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