"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  Twitter,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { normalizarUrlHttps } from "@/helpers/normalizarUrlHttps";

interface ColumnaRedesProps {
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  linkedin: string | null;
  x: string | null;
  tiktok: string | null;
}

interface RedSocial {
  url: string | null;
  Icono: LucideIcon;
  etiqueta: string;
}

export default function ColumnaRedes({
  instagram,
  facebook,
  youtube,
  linkedin,
  x,
  tiktok,
}: ColumnaRedesProps) {
  const redes: RedSocial[] = [
    { url: instagram, Icono: Instagram, etiqueta: "Instagram" },
    { url: facebook, Icono: Facebook, etiqueta: "Facebook" },
    { url: youtube, Icono: Youtube, etiqueta: "YouTube" },
    { url: linkedin, Icono: Linkedin, etiqueta: "LinkedIn" },
    { url: x, Icono: Twitter, etiqueta: "X" },
    { url: tiktok, Icono: Music2, etiqueta: "TikTok" },
  ];

  const visibles = redes
    .map((red) => ({ ...red, url: normalizarUrlHttps(red.url) }))
    .filter((red): red is RedSocial & { url: string } => red.url !== null);

  if (visibles.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80">
        Redes
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {visibles.map(({ url, Icono, etiqueta }) => (
          <a
            key={etiqueta}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={etiqueta}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-primario)_20%,transparent)] opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
          >
            <Icono size={16} />
          </a>
        ))}
      </div>
    </div>
  );
}
