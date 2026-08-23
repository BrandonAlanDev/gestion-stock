"use client";

import Link from "next/link";
import { Eye, FileText, Pencil } from "lucide-react";

import Badge from "@/components/ui/badge";
import EstadoVacio from "@/components/ui/estado-vacio";
import useVistaPrevia from "@/components/admin/diseno/use-vista-previa";
import type { PaginaDinamicaResumen } from "./tipos-contenido";

const estiloBotonAccion =
  "inline-flex items-center gap-1.5 rounded-md p-1.5 text-xs font-medium text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]";

export default function SeccionPaginasDinamicas({
  paginas,
}: {
  paginas: PaginaDinamicaResumen[];
}) {
  const { abrirVistaPrevia } = useVistaPrevia();

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--admin-texto-suave)]">
        Las páginas dinámicas se editan con el constructor de páginas. Desde
        acá podés verlas o abrir su editor.
      </p>

      {paginas.length === 0 ? (
        <EstadoVacio
          icono={FileText}
          titulo="Todavía no hay páginas dinámicas"
          accion={
            <Link
              href="/admin/custom-page"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-borde)] px-4 py-2 text-sm font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]"
            >
              Crear página
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {paginas.map((pagina) => (
            <div
              key={pagina.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-3 transition-colors hover:border-[var(--admin-borde)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)]">
                <FileText size={16} className="text-[var(--admin-texto)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--admin-texto)]">
                  {pagina.title}
                </p>
                <p className="truncate text-xs text-[var(--admin-texto-suave)]">
                  /{pagina.slug}
                </p>
              </div>
              <Badge variante={pagina.isActive ? "activo" : "inactivo"}>
                {pagina.isActive ? "Activa" : "Inactiva"}
              </Badge>
              <span className="text-xs text-[var(--admin-texto-suave)]">
                {pagina.secciones} secciones
              </span>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => abrirVistaPrevia(pagina.slug)}
                  title="Ver"
                  className={estiloBotonAccion}
                >
                  <Eye size={15} />
                  <span className="hidden sm:inline">Ver</span>
                </button>
                <Link
                  href="/admin/custom-page"
                  title="Editar"
                  className={estiloBotonAccion}
                >
                  <Pencil size={15} />
                  <span className="hidden sm:inline">Editar</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
