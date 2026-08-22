// src/components/admin/page-config/SlideEditor.tsx
"use client";

import { useState, useRef } from "react";
import { CarouselType } from "../../../../generated/prisma"
import { createCarouselSlide, updateCarouselSlide } from "@/actions/page-config/carousel-slides.actions";
import { uploadCarouselImage } from "@/actions/page-config/upload-carousel-image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

type Slide = Awaited<ReturnType<typeof import("@/actions/page-config/carousel-slides.actions").getCarouselSlides>>[number];

interface Props {
  slide: Slide | null;
  carouselType: CarouselType;
  onClose: () => void;
}

export default function SlideEditor({ slide, carouselType, onClose }: Props) {
  const [image, setImage] = useState(slide?.image || "");
  const [title, setTitle] = useState(slide?.title || "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle || "");
  const [text, setText] = useState(slide?.text || "");
  const [url, setUrl] = useState(slide?.url || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadCarouselImage(base64);
        if (res.error) toast.error(res.error);
        else {
          setImage(res.url!);
          toast.success("Imagen subida");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Error al subir imagen");
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.set("image", image);
    formData.set("carouselType", carouselType);
    if (title) formData.set("title", title);
    if (subtitle) formData.set("subtitle", subtitle);
    if (text) formData.set("text", text);
    if (url) formData.set("url", url);

    let result;
    if (slide) {
      result = await updateCarouselSlide(slide.id, formData);
    } else {
      result = await createCarouselSlide(formData);
    }

    if (result.error) toast.error(result.error);
    else {
      toast.success(slide ? "Diapositiva actualizada" : "Diapositiva creada");
      onClose();
    }
  };

  const showTitleField = carouselType !== "HERO_SIMPLE";
  const showTextField = carouselType === "HERO_TEXTO" || carouselType === "HERO_LINK";
  const showUrlField = carouselType === "HERO_LINK";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {slide ? "Editar diapositiva" : "Nueva diapositiva"}
        </h2>

        {/* Imagen */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-400 mb-1">Imagen</label>
          {image && (
            <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
              <Image src={image} alt="preview" fill className="object-cover" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "Seleccionar imagen"}
          </Button>
        </div>

        {showTitleField && (
          <div className="mb-4">
            <label className="block text-sm text-neutral-400 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-neutral-400 mb-1">Subtítulo (opcional)</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
          />
        </div>

        {showTextField && (
          <div className="mb-4">
            <label className="block text-sm text-neutral-400 mb-1">Texto</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
            />
          </div>
        )}

        {showUrlField && (
          <div className="mb-4">
            <label className="block text-sm text-neutral-400 mb-1">Enlace</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
              placeholder="https://..."
            />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="celeste" onClick={handleSubmit} disabled={!image}>
            {slide ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </div>
  );
}