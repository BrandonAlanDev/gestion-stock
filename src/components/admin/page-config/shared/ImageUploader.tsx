"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import SubidaImagen from "@/components/imagen/SubidaImagen";
import type { FormaRecorte } from "@/components/imagen/tipos";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  relacionAspecto?: number;
  formaRecorte?: FormaRecorte;
  deshabilitada?: boolean;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  relacionAspecto = 1,
  formaRecorte = "rectangular",
  deshabilitada = false,
}: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const operacionRef = useRef(0);

  const base64AFile = (dataUrl: string): File => {
    const [meta, contenido] = dataUrl.split(",");
    const tipoMime = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
    const extension = tipoMime.split("/")[1]?.split("+")[0].replace("jpeg", "jpg") || "png";
    const binario = atob(contenido);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
      bytes[i] = binario.charCodeAt(i);
    }
    return new File([bytes], `imagen.${extension}`, { type: tipoMime });
  };

  const subirYActualizar = async (dataUrl: string, operacion: number) => {
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("file", base64AFile(dataUrl));

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir");
      }

      if (operacion === operacionRef.current) {
        onChange(data.url);
        toast.success("Imagen subida correctamente");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al subir imagen"
      );
    } finally {
      if (operacion === operacionRef.current) setSubiendo(false);
    }
  };

  const manejarCambio = (nuevoValor: string) => {
    if (subiendo || deshabilitada) return;
    const operacion = ++operacionRef.current;
    if (!nuevoValor) {
      onChange("");
      setSubiendo(false);
      return;
    }
    void subirYActualizar(nuevoValor, operacion);
  };

  return (
    <div className="flex flex-col gap-2 text-[var(--admin-texto)]">
      <label
        className="mb-3 block text-[10px] font-black uppercase tracking-[0.3em] text-[var(--admin-texto-suave)]"
      >
        {label}
      </label>

      <div className="overflow-hidden rounded-[2rem] border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
        <div className="aspect-video relative flex items-center justify-center">
          {value ? (
            <Image src={value} alt={label} fill className="object-cover" />
          ) : (
            <div className="text-center text-[var(--admin-texto-suave)]">
              <ImageIcon size={42} className="mx-auto mb-3 text-[var(--admin-primario)]" />
              <p className="text-[10px] uppercase tracking-[0.3em] font-black">
                Sin Imagen
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4">
          <SubidaImagen
            valor={value}
            alCambiar={manejarCambio}
            relacionAspecto={relacionAspecto}
            formaRecorte={formaRecorte}
            deshabilitada={deshabilitada || subiendo}
            etiqueta={value ? "Editar imagen" : "Subir Imagen"}
          />
        </div>
      </div>

      {subiendo && (
        <p className="text-[10px] uppercase tracking-[0.3em] font-black">
          Procesando...
        </p>
      )}
    </div>
  );
}
