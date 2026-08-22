"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";
import { compressImage } from "@/lib/image-utils";
import { fileToBase64, getContrastColor } from "@/lib/utils";
import { Crop, X } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
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
  const { pageConfig } = usePageConfig();
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor((pageConfig?.secondaryColor as string) || "#00b4d8");
  const isDarkBg = textColor === "#ffffff";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const overlayBorder = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const mutedColor = textColor + "99";

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
      const base64 =
        archivo.type === "image/png"
          ? await fileToBase64(archivo)
          : await fileToBase64(await compressImage(archivo, 1200, 1200, 0.8));
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
    setOrderedImages(prev => {
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
      <div className="flex justify-between pb-2" style={{ borderBottom: `1px solid ${overlayBorder}` }}>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: mutedColor }}>
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
          background: inputBg,
          border: `1px solid ${overlayBorder}`,
          borderRadius: "12px",
          color: textColor,
          fontSize: "14px",
        }}
      />
      {uploading && (
        <p className="text-xs flex items-center gap-2" style={{ color: mutedColor }}>
          <span
            className="inline-block w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: mutedColor, borderTopColor: "transparent" }}
          />
          Procesando...
        </p>
      )}
      <div className="flex gap-4 flex-wrap">
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
              className={`relative w-24 h-24 overflow-hidden group transition-all duration-200 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40 scale-95 z-10" : ""
                }`}
              style={{
                border: `1px solid ${isDragging ? accent : overlayBorder}`,
                borderRadius: "12px",
                boxShadow: isDragging ? `0 0 0 2px ${accent}4D` : "none",
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
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ background: accent }}
                >
                  <Crop size={10} style={{ color: "#fff" }} />
                  <span style={{ color: "#fff" }}>Editar</span>
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "#ef4444" }}
              >
                <X size={12} style={{ color: "#fff" }} />
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
