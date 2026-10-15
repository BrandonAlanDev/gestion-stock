"use client";

import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import Badge from "@/components/ui/badge";
import type { Carousel } from "@/types/carousel";

import type { HomegridContenido } from "./tipos-contenido";

const estiloBotonAccion =
  "rounded-md p-1.5 text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]";

interface Props {
  direccion: string | null;
  mostrarUbicacionOculta: boolean;
  instancias: HomegridContenido[];
  carruseles: Carousel[];
  etiquetasTipo: Record<Carousel["type"], string>;
  iconosTipo: Record<Carousel["type"], LucideIcon>;
  iconoUbicacion: LucideIcon;
  iconoDestacada: LucideIcon;
  alMostrarUbicacion: () => void;
  alMostrarDestacada: (id: string) => void;
  alMostrarCarrusel: (carousel: Carousel) => void;
}

export default function SeccionOcultas({
  direccion,
  mostrarUbicacionOculta,
  instancias,
  carruseles,
  etiquetasTipo,
  iconosTipo,
  iconoUbicacion,
  iconoDestacada,
  alMostrarUbicacion,
  alMostrarDestacada,
  alMostrarCarrusel,
}: Props) {
  const fila = ({
    id,
    icono: Icono,
    titulo,
    detalle,
    alMostrar,
  }: {
    id: string;
    icono: LucideIcon;
    titulo: string;
    detalle: string;
    alMostrar: () => void;
  }): ReactNode => (
    <div
      key={id}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)]">
        <Icono size={16} className="text-[var(--admin-texto)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--admin-texto)]">
          {titulo}
        </p>
        <p className="truncate text-xs text-[var(--admin-texto-suave)]">
          {detalle}
        </p>
      </div>
      <Badge variante="oculto">Oculto</Badge>
      <button
        type="button"
        onClick={alMostrar}
        title="Mostrar"
        className={estiloBotonAccion}
      >
        <Eye size={15} />
      </button>
    </div>
  );

  return (
    <div className="mt-4 rounded-xl border border-dashed border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <EyeOff size={15} className="text-[var(--admin-texto-suave)]" />
        <h4 className="text-sm font-semibold text-[var(--admin-texto)]">
          Secciones ocultas
        </h4>
      </div>
      <div className="space-y-2">
        {mostrarUbicacionOculta &&
          fila({
            id: "location",
            icono: iconoUbicacion,
            titulo: "Ubicación",
            detalle: direccion ?? "Sin dirección",
            alMostrar: alMostrarUbicacion,
          })}
        {instancias.map((h) =>
          fila({
            id: `hidden-destacada-${h.id}`,
            icono: iconoDestacada,
            titulo: h.title?.trim() ? h.title : "Sección destacada",
            detalle: h.grids.length ? `${h.grids.length} tarjetas` : "Sin configurar",
            alMostrar: () => alMostrarDestacada(h.id),
          })
        )}
        {carruseles.map((carousel) => {
          const etiqueta = etiquetasTipo[carousel.type];
          const cantidad = carousel.slides?.length ?? 0;
          return fila({
            id: `hidden-carousel-${carousel.id}`,
            icono: iconosTipo[carousel.type],
            titulo: carousel.title || etiqueta,
            detalle: `${etiqueta} · ${cantidad} slides`,
            alMostrar: () => alMostrarCarrusel(carousel),
          });
        })}
      </div>
    </div>
  );
}
