"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
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
            alCambiar={onChange}
            relacionAspecto={relacionAspecto}
            formaRecorte={formaRecorte}
            deshabilitada={deshabilitada}
            etiqueta={value ? "Editar imagen" : "Seleccionar imagen"}
          />
        </div>
      </div>
    </div>
  );
}
