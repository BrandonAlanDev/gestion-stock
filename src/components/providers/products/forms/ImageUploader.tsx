"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";
import { compressImage } from "@/lib/image-utils";
import { fileToBase64 } from "@/lib/utils";
import { Crop, X } from "lucide-react";
import EditorRecorte from "@/components/imagen/EditorRecorte";

export interface PendingImage {
  url?: string;
  publicId?: string;
  file?: File;
  preview?: string;
}

interface ImageUploaderProps {
  images: PendingImage[];
  onAddImages: (newImages: PendingImage[]) => void;
  onRemoveImage: (index: number) => void;
  onReorder?: (sourceIndex: number, targetIndex: number) => void;
  alEditarImagen?: (indice: number, nuevaImagen: string) => void;
}

const FORMATOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

export default function ImageUploader({
  images,
  onAddImages,
  onRemoveImage,
  onReorder,
  alEditarImagen,
}: ImageUploaderProps) {
  // Estado local para el orden visual durante el arrastre
  const [orderedImages, setOrderedImages] = useState<PendingImage[]>(images);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagenParaRecortar, setImagenParaRecortar] = useState<string | null>(null);
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalIndexRef = useRef<number | null>(null);

  // Sincronizar con las props SOLO si no estamos arrastrando
  useEffect(() => {
    if (draggedIndex === null) {
      setOrderedImages(images);
    }
  }, [images, draggedIndex]);

  // Selección de archivos: valida y abre el editor de recorte
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const archivos = Array.from(e.target.files);
    if (archivos.length > 1) {
      toast.error("Seleccioná una sola imagen por vez.");
      return;
    }
    if (images.length + archivos.length > 4) {
      toast.error("Máximo 4 imágenes.");
      return;
    }
    const archivo = archivos[0];
    if (!archivo) return;
    if (!FORMATOS_PERMITIDOS.includes(archivo.type)) {
      toast.error("Formato no válido. Usá PNG, JPG o WebP.");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera los 5MB");
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(await compressImage(archivo, 2500, 2500, 0.95));
      setImagenParaRecortar(base64);
      setIndiceEdicion(null);
      setEditorAbierto(true);
    } catch {
      toast.error(`Error al procesar ${archivo.name}`);
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  const reabrirEditor = (indice: number) => {
    if (!alEditarImagen) return;
    const img = orderedImages[indice];
    if (img.preview?.startsWith("data:")) {
      setImagenParaRecortar(img.preview);
      setIndiceEdicion(indice);
      setEditorAbierto(true);
    }
  };

  const confirmarRecorte = (resultado: string) => {
    setEditorAbierto(false);
    setImagenParaRecortar(null);
    if (indiceEdicion !== null) {
      if (alEditarImagen) alEditarImagen(indiceEdicion, resultado);
      setIndiceEdicion(null);
    } else {
      onAddImages([{ preview: resultado }]);
    }
  };

  const cancelarRecorte = () => {
    setEditorAbierto(false);
    setImagenParaRecortar(null);
    setIndiceEdicion(null);
  };

  const handleRemove = (index: number) => {
    const img = orderedImages[index];
    if (img.preview && !img.url && img.preview.startsWith("blob:")) {
      URL.revokeObjectURL(img.preview);
    }
    onRemoveImage(index);
  };

  // ── Drag & drop con desplazamiento en tiempo real ──
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    originalIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // Reordenar temporalmente el estado local para mostrar el desplazamiento
    setOrderedImages((prev) => {
      const newOrder = [...prev];
      const [moved] = newOrder.splice(originalIndexRef.current!, 1);
      newOrder.splice(targetIndex, 0, moved);
      // Actualizar el índice original arrastrado para futuros movimientos
      originalIndexRef.current = targetIndex;
      return newOrder;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, finalIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || originalIndexRef.current === null) return;

    // Llamar al padre con el índice original y el final
    if (onReorder) {
      onReorder(draggedIndex, finalIndex);
    }

    setDraggedIndex(null);
    originalIndexRef.current = null;
  };

  const handleDragEnd = () => {
    // Si se canceló el arrastre (no hubo drop), restaurar el orden original
    if (draggedIndex !== null) {
      setOrderedImages(images); // vuelve al orden de las props
    }
    setDraggedIndex(null);
    originalIndexRef.current = null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between border-b border-[var(--admin-borde)] pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-texto-suave)]">
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
        className="w-full cursor-pointer rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3 text-sm text-[var(--admin-texto)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--admin-primario)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[var(--admin-primario-texto)]"
      />
      {uploading && (
        <p className="flex items-center gap-2 text-xs text-[var(--admin-texto-suave)]">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--admin-texto-suave)] border-t-transparent" />
          Procesando...
        </p>
      )}
      <div className="flex flex-wrap gap-4">
        {orderedImages.map((img, idx) => {
          const src = img.url || img.preview || "";
          const isDragging = draggedIndex === idx;
          const esNueva = !!img.preview?.startsWith("data:");

          return (
            <div
              key={img.preview || img.url || idx}
              draggable={!!onReorder}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative h-24 w-24 overflow-hidden rounded-xl border transition-all duration-200 ${
                isDragging ? "z-10 scale-95 opacity-40" : "cursor-grab active:cursor-grabbing"
              }`}
              style={{
                borderColor: isDragging ? "var(--admin-primario)" : "var(--admin-borde)",
                zIndex: isDragging ? 10 : 1,
              }}
            >
              <Image
                src={src}
                alt={`Preview ${idx}`}
                fill
                className="object-cover"
                onError={() => toast.error(`No se pudo cargar la imagen ${idx + 1}`)}
              />
              {esNueva && alEditarImagen && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reabrirEditor(idx);
                  }}
                  className="absolute bottom-1 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-1 rounded-full bg-[var(--admin-primario)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--admin-primario-texto)] opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Crop size={10} />
                  Editar
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
      <EditorRecorte
        abierto={editorAbierto}
        imagen={imagenParaRecortar || ""}
        relacionAspecto={1}
        alConfirmar={confirmarRecorte}
        alCancelar={cancelarRecorte}
      />
    </div>
  );
}
