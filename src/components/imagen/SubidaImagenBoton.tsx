"use client";

import type { ReactNode, RefObject } from "react";
import { Crop, Upload, X } from "lucide-react";

interface SubidaImagenBotonProps {
  valor: string;
  procesando: boolean;
  deshabilitada: boolean;
  puedeEditarRecorte: boolean;
  etiqueta: string;
  obligatoria: boolean;
  textoAyuda: string;
  tamanoMaximoMb: number;
  primario: string;
  textoSobreSecundario: string;
  errorInterno: string | null;
  errorVisible: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  editorRecorte: ReactNode;
  manejarSeleccion: (evento: React.ChangeEvent<HTMLInputElement>) => void;
  reabrirEditor: () => void;
  quitarImagen: () => void;
}

export default function SubidaImagenBoton({
  valor,
  procesando,
  deshabilitada,
  puedeEditarRecorte,
  etiqueta,
  obligatoria,
  textoAyuda,
  tamanoMaximoMb,
  primario,
  textoSobreSecundario,
  errorInterno,
  errorVisible,
  inputRef,
  editorRecorte,
  manejarSeleccion,
  reabrirEditor,
  quitarImagen,
}: SubidaImagenBotonProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={procesando || deshabilitada}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: primario + "1A",
            border: `1px solid ${primario}40`,
            color: primario,
          }}
        >
          {procesando ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Procesando...
            </span>
          ) : (
            <>
              <Upload size={16} />
              {etiqueta}
              {obligatoria && <span className="text-red-500">*</span>}
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={manejarSeleccion}
          className="sr-only"
          disabled={procesando || deshabilitada}
        />

        {valor && (
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="h-16 w-16 overflow-hidden rounded-lg border"
              style={{
                borderColor: primario + "40",
                backgroundColor: primario + "10",
              }}
            >
              <img
                src={valor}
                alt="Vista previa"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
            {puedeEditarRecorte && (
              <button
                type="button"
                onClick={reabrirEditor}
                disabled={deshabilitada}
                title="Editar recorte"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                style={{ color: primario, backgroundColor: primario + "14" }}
              >
                <Crop size={14} /> Editar recorte
              </button>
            )}
            <button
              type="button"
              onClick={quitarImagen}
              disabled={deshabilitada}
              title="Quitar imagen"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{ color: textoSobreSecundario + "99" }}
            >
              <X size={14} /> Quitar
            </button>
          </div>
        )}
      </div>

      {!valor && !errorInterno && (
        <p className="text-xs" style={{ color: textoSobreSecundario + "60" }}>
          {textoAyuda} · máx {tamanoMaximoMb}MB
        </p>
      )}
      {errorVisible && (
        <p className="text-xs" style={{ color: primario }}>
          {errorVisible}
        </p>
      )}

      {editorRecorte}
    </div>
  );
}
