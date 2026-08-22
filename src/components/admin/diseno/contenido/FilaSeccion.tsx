"use client";

import type { LucideIcon } from "lucide-react";
import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Palette,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import Badge from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AccionesFilaSeccion {
  alEditar?: () => void;
  alDiseno?: () => void;
  alAjustes?: () => void;
  alDuplicar?: () => void;
  alVisibilidad?: () => void;
  etiquetaVisibilidad?: string;
  alEliminar?: () => void;
}

interface FilaSeccionProps extends AccionesFilaSeccion {
  id: string;
  icono: LucideIcon;
  titulo: string;
  detalle: string;
  varianteBadge:
    | "activo"
    | "inactivo"
    | "oculto"
    | "sin-configurar"
    | "borrador"
    | "info";
  textoBadge: string;
}

const estiloBotonAccion =
  "rounded-md p-1.5 text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]";

export default function FilaSeccion({
  id,
  icono: Icono,
  titulo,
  detalle,
  varianteBadge,
  textoBadge,
  alEditar,
  alDiseno,
  alAjustes,
  alDuplicar,
  alVisibilidad,
  etiquetaVisibilidad,
  alEliminar,
}: FilaSeccionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconoVisibilidad = etiquetaVisibilidad === "Ocultar" ? Eye : EyeOff;

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-3 transition-colors hover:border-[var(--admin-borde)]",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-[var(--admin-texto-suave)] transition hover:text-[var(--admin-texto)] active:cursor-grabbing"
      >
        <GripVertical size={15} />
      </button>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)]">
        <Icono size={16} className="text-[var(--admin-texto)]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--admin-texto)]">{titulo}</p>
        <p className="truncate text-xs text-[var(--admin-texto-suave)]">{detalle}</p>
      </div>

      <Badge variante={varianteBadge}>{textoBadge}</Badge>

      <div className="flex shrink-0 flex-wrap items-center gap-1">
        {alEditar && (
          <button
            type="button"
            onClick={alEditar}
            title="Editar"
            className={estiloBotonAccion}
          >
            <Pencil size={15} />
          </button>
        )}
        {alDiseno && (
          <button
            type="button"
            onClick={alDiseno}
            title="Diseño"
            className={estiloBotonAccion}
          >
            <Palette size={15} />
          </button>
        )}
        {alAjustes && (
          <button
            type="button"
            onClick={alAjustes}
            title="Ajustes"
            className={estiloBotonAccion}
          >
            <SlidersHorizontal size={15} />
          </button>
        )}
        {alDuplicar && (
          <button
            type="button"
            onClick={alDuplicar}
            title="Duplicar"
            className={estiloBotonAccion}
          >
            <Copy size={15} />
          </button>
        )}
        {alVisibilidad && (
          <button
            type="button"
            onClick={alVisibilidad}
            title={etiquetaVisibilidad}
            className={estiloBotonAccion}
          >
            <IconoVisibilidad size={15} />
          </button>
        )}
        {alEliminar && (
          <button
            type="button"
            onClick={alEliminar}
            title="Eliminar"
            className={cn(estiloBotonAccion, "hover:text-red-400")}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
