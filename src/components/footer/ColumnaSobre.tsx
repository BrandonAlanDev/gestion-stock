"use client";

import Image from "next/image";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";

interface ColumnaSobreProps {
  logo: string | null;
  storeName: string;
  texto: string | null;
}

export default function ColumnaSobre({ logo, storeName, texto }: ColumnaSobreProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {logo && (
          <Image
            src={logo}
            alt={`Logo de ${storeName}`}
            width={40}
            height={40}
            unoptimized={!imagenAdmiteOptimizacion(logo)}
            className="h-10 w-10 rounded-lg object-cover"
          />
        )}
        <span className="text-lg font-bold">{storeName}</span>
      </div>
      {texto && (
        <p className="mt-3 text-sm leading-relaxed opacity-70">{texto}</p>
      )}
    </div>
  );
}
