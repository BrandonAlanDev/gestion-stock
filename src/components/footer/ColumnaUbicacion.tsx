"use client";

import { MapPin } from "lucide-react";
import { normalizarUrlHttps } from "@/helpers/normalizarUrlHttps";

interface ColumnaUbicacionProps {
  address: string | null;
  city: string | null;
  mapsUrl: string | null;
}

export default function ColumnaUbicacion({ address, city, mapsUrl }: ColumnaUbicacionProps) {
  if (!address && !city) return null;
  const urlMapa = normalizarUrlHttps(mapsUrl);

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80">
        Ubicación
      </h3>
      <div className="mt-3 flex items-start gap-2 text-sm">
        <MapPin size={14} className="mt-0.5 shrink-0 opacity-70" />
        <span className="opacity-70">
          {address}
          {address && city && <span className="mx-1">·</span>}
          {city}
        </span>
      </div>
      {urlMapa && (
        <a
          href={urlMapa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
        >
          Ver en el mapa
        </a>
      )}
    </div>
  );
}
