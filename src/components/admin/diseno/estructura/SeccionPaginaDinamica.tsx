"use client";

import Link from "next/link";
import {
  Eye,
  FileText,
  HelpCircle,
  Images,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  Megaphone,
  Sparkles,
  Type,
  type LucideIcon,
} from "lucide-react";

import Badge from "@/components/ui/badge";
import useVistaPrevia from "@/components/admin/diseno/use-vista-previa";

import type { PaginaDinamicaEstructura } from "./tipos-estructura";

const ICONOS_SECCION: Record<string, LucideIcon> = {
  HERO: LayoutDashboard,
  CARDS: LayoutGrid,
  FAQ: HelpCircle,
  TIMELINE: ListOrdered,
  CTA: Megaphone,
  FEATURES: Sparkles,
  TEXT: Type,
  GALLERY: Images,
};

export default function SeccionPaginaDinamica({
  pagina,
}: {
  pagina: PaginaDinamicaEstructura;
}) {
  const { abrirVistaPrevia } = useVistaPrevia();
  const seccionesOrdenadas = [...pagina.secciones].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-3">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-[var(--admin-texto)]">{pagina.title}</p>
          <Badge variante={pagina.isActive ? "activo" : "inactivo"}>
            {pagina.isActive ? "Activa" : "Inactiva"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => abrirVistaPrevia(pagina.slug)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
          >
            <Eye size={14} />
            Ver
          </button>
          <Link
            href="/admin/custom-page"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-borde)] px-3 py-1.5 text-xs font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]"
          >
            Editar en el constructor
          </Link>
        </div>
      </div>

      <p className="text-sm text-[var(--admin-texto-suave)]">
        El orden de estas secciones se edita con el constructor de páginas.
      </p>

      {seccionesOrdenadas.length === 0 ? (
        <p className="text-sm text-[var(--admin-texto-suave)]">
          Esta página no tiene secciones todavía
        </p>
      ) : (
        <div className="space-y-2">
          {seccionesOrdenadas.map((seccion) => {
            const Icono = ICONOS_SECCION[seccion.type] ?? FileText;
            return (
              <div
                key={seccion.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-3 transition-colors hover:border-[var(--admin-borde)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)]">
                  <Icono size={16} className="text-[var(--admin-texto)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--admin-texto)]">
                    {seccion.title ?? "Sección sin título"}
                  </p>
                  <p className="truncate text-xs text-[var(--admin-texto-suave)]">
                    {seccion.type}
                  </p>
                </div>
                <span className="text-xs text-[var(--admin-texto-suave)]">
                  #{seccion.order + 1}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
