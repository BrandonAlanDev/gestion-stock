"use client";

import {
  ImageIcon,
} from "lucide-react";

import Image from "next/image";

import { useState } from "react";

import { toast } from "sonner";

interface Props {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}

export default function ImageUploader({
  label,
  value,
  onChange,
}: Props) {
  const [uploading, setUploading] =
    useState(false);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch(
        "/api/upload-image",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error al subir"
        );
      }

      onChange(data.url);

      toast.success(
        "Imagen subida correctamente"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al subir imagen"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 block mb-3">
        {label}
      </label>

      <div className="rounded-[2rem] border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="aspect-video relative bg-black flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-center">
              <ImageIcon
                size={42}
                className="mx-auto text-neutral-700 mb-3"
              />

              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-600">
                Sin Imagen
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-900">
          <label className="h-12 rounded-2xl bg-cyan-500 text-black text-[10px] uppercase tracking-[0.3em] font-black flex items-center justify-center cursor-pointer">
            {uploading
              ? "Procesando..."
              : "Subir Imagen"}

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}