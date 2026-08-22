"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
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
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function ImageUploader({
  label,
  value,
  onChange,
}: Props) {
  const [uploading, setUploading] =
    useState(false);
  const pageConfig = usePageConfig();
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
    <div className="flex flex-col gap-2"
    style={{ color: getContrastColor(pageConfig?.pageConfig?.secondaryColor)
     }}  >
      <label className="text-[10px] uppercase tracking-[0.3em] font-black block mb-3"
      style={{ color: getContrastColor(pageConfig?.pageConfig?.secondaryColor)
       }}
      >
        {label}
      </label>

      <div className="rounded-[2rem] border overflow-hidden"
      style={{ borderColor: getContrastColor(pageConfig?.pageConfig?.primaryColor),
        backgroundColor: pageConfig?.pageConfig?.primaryColor.concat("33")
      }}>
        <div className="aspect-video relative flex items-center justify-center">
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
                className="mx-auto mb-3"
              />

              <p className="text-[10px] uppercase tracking-[0.3em] font-black">
                Sin Imagen
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t "
        style={{ borderColor: getContrastColor(pageConfig?.pageConfig?.primaryColor),
          backgroundColor: pageConfig?.pageConfig?.secondaryColor
        }}>
          <label className="h-12 rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: pageConfig?.pageConfig?.primaryColor,
            color: getContrastColor(pageConfig?.pageConfig?.primaryColor)
          }}
          >
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