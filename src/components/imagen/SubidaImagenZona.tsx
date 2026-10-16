"use client";

import Image from "next/image";
import type { ReactNode, RefObject } from "react";
import { Crop, Upload, X } from "lucide-react";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";
import { obtenerColorContraste } from "@/lib/utilidades/obtener-color-contraste";

interface SubidaImagenZonaProps {
  valor: string;
  etiqueta: string;
  claseZona: string;
  procesando: boolean;
  deshabilitada: boolean;
  arrastrando: boolean;
  textoAyuda: string;
  tamanoMaximoMb: number;
  primario: string;
  textoSobreSecundario: string;
  colorAyuda: string;
  adminActivo: boolean;
  errorVisible: string | null;
  contenidoSuperpuesto?: ReactNode;
  accionesSobreZona: boolean;
  puedeEditarRecorte: boolean;
  referenciaEntrada: RefObject<HTMLInputElement | null>;
  editorRecorte: ReactNode;
  alSeleccionar: (evento: React.ChangeEvent<HTMLInputElement>) => void;
  alEntrarArrastre: (evento: React.DragEvent) => void;
  alArrastrarSobre: (evento: React.DragEvent) => void;
  alSalirArrastre: (evento: React.DragEvent) => void;
  alSoltar: (evento: React.DragEvent) => void;
  alAbrirSelector: () => void;
  alAbrirRecorte: () => void;
  alQuitar: () => void;
}

export default function SubidaImagenZona({
  valor,
  etiqueta,
  claseZona,
  procesando,
  deshabilitada,
  arrastrando,
  textoAyuda,
  tamanoMaximoMb,
  primario,
  textoSobreSecundario,
  colorAyuda,
  adminActivo,
  errorVisible,
  contenidoSuperpuesto,
  accionesSobreZona,
  puedeEditarRecorte,
  referenciaEntrada,
  editorRecorte,
  alSeleccionar,
  alEntrarArrastre,
  alArrastrarSobre,
  alSalirArrastre,
  alSoltar,
  alAbrirSelector,
  alAbrirRecorte,
  alQuitar,
}: SubidaImagenZonaProps) {
  return (
    <div className="space-y-2">
      <div
        className="relative"
        onDragEnter={alEntrarArrastre}
        onDragOver={alArrastrarSobre}
        onDragLeave={alSalirArrastre}
        onDrop={alSoltar}
      >
        <button
          type="button"
          onClick={alAbrirSelector}
          disabled={procesando || deshabilitada}
          aria-label="Seleccionar imagen"
          className={`group relative block w-full ${claseZona} cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60`}
          style={{
            borderColor: adminActivo
              ? arrastrando
                ? "var(--admin-primario)"
                : "var(--admin-borde)"
              : arrastrando
                ? primario
                : primario + "50",
            backgroundColor: adminActivo
              ? arrastrando
                ? "var(--admin-primario-suave)"
                : "var(--admin-fondo-suave)"
              : arrastrando
                ? primario + "20"
                : primario + "08",
            boxShadow: arrastrando
              ? adminActivo
                ? "0 0 0 4px color-mix(in srgb, var(--admin-primario) 20%, transparent), 0 0 24px color-mix(in srgb, var(--admin-primario) 50%, transparent)"
                : `0 0 0 4px ${primario}33, 0 0 24px ${primario}80`
              : undefined,
          }}
        >
          {valor ? (
            <Image src={valor} alt={etiqueta} fill sizes="(min-width: 768px) 50vw, 100vw" unoptimized={!imagenAdmiteOptimizacion(valor)} draggable={false} className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <Upload size={32} style={{ color: primario }} />
              <span className="text-sm font-semibold" style={{ color: textoSobreSecundario }}>
                Seleccionar imagen
              </span>
              <span className="text-xs" style={{ color: colorAyuda }}>
                {textoAyuda} · máx {tamanoMaximoMb}MB
              </span>
            </span>
          )}

          {valor && contenidoSuperpuesto && (
            <span className="pointer-events-none absolute inset-0 z-10">{contenidoSuperpuesto}</span>
          )}

          {arrastrando && !procesando && (
            <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/60">
              <span
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: primario,
                  color: adminActivo
                    ? "var(--admin-primario-texto)"
                    : obtenerColorContraste(primario),
                }}
              >
                <Upload size={16} />
                Soltá la imagen aquí
              </span>
            </span>
          )}

          {procesando && (
            <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
              <span className="flex items-center gap-2 text-sm font-medium text-white">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Procesando…
              </span>
            </span>
          )}

          {valor && !procesando && !accionesSobreZona && (
            <span className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="text-sm font-medium text-white">Cambiar imagen</span>
            </span>
          )}
        </button>

        {valor && accionesSobreZona && !procesando && (
          <div className="absolute right-2 top-2 z-40 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={alAbrirSelector}
              disabled={deshabilitada}
              title="Cambiar imagen"
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md transition-colors"
              style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#ffffff" }}
            >
              <Upload size={12} /> Cambiar
            </button>
            {puedeEditarRecorte && (
              <button
                type="button"
                onClick={alAbrirRecorte}
                disabled={deshabilitada}
                title="Editar recorte"
                className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md transition-colors"
                style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#ffffff" }}
              >
                <Crop size={12} /> Recortar
              </button>
            )}
            <button
              type="button"
              onClick={alQuitar}
              disabled={deshabilitada}
              title="Quitar imagen"
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md transition-colors"
              style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#ffffff" }}
            >
              <X size={12} /> Quitar
            </button>
          </div>
        )}
      </div>

      <input
        ref={referenciaEntrada}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={alSeleccionar}
        className="sr-only"
        disabled={procesando || deshabilitada}
      />

      {valor && !accionesSobreZona && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={alAbrirSelector}
            disabled={deshabilitada}
            title="Cambiar imagen"
            className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${adminActivo ? "bg-[var(--admin-primario-suave)] text-[var(--admin-primario)] hover:opacity-80" : ""}`}
            style={adminActivo ? undefined : { color: primario, backgroundColor: primario + "14" }}
          >
            <Upload size={14} /> Cambiar imagen
          </button>
          {puedeEditarRecorte && (
            <button
              type="button"
              onClick={alAbrirRecorte}
              disabled={deshabilitada}
              title="Editar recorte"
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${adminActivo ? "bg-[var(--admin-primario-suave)] text-[var(--admin-primario)] hover:opacity-80" : ""}`}
              style={adminActivo ? undefined : { color: primario, backgroundColor: primario + "14" }}
            >
              <Crop size={14} /> Editar recorte
            </button>
          )}
          <button
            type="button"
            onClick={alQuitar}
            disabled={deshabilitada}
            title="Quitar imagen"
            className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${adminActivo ? "text-[var(--admin-texto-suave)] hover:text-[var(--admin-peligro)]" : ""}`}
            style={adminActivo ? undefined : { color: textoSobreSecundario + "99" }}
          >
            <X size={14} /> Quitar
          </button>
        </div>
      )}

      {errorVisible && (
        <p className="text-xs" style={{ color: adminActivo ? "var(--admin-peligro)" : primario }}>
          {errorVisible}
        </p>
      )}

      {editorRecorte}
    </div>
  );
}
