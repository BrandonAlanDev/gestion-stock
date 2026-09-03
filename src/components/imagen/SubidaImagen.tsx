"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Crop, Upload, X } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { compressImage } from "@/lib/image-utils";
import { fileToBase64, getContrastColor } from "@/lib/utils";
import EditorRecorte from "./EditorRecorte";
import SubidaImagenBoton from "./SubidaImagenBoton";
import type { FormaRecorte } from "./tipos";

interface SubidaImagenProps {
  valor: string;
  alCambiar: (valor: string) => void;
  relacionAspecto?: number;
  formaRecorte?: FormaRecorte;
  tamanoMaximoMb?: number;
  obligatoria?: boolean;
  etiqueta?: string;
  textoAyuda?: string;
  anchoMaximoCompresion?: number;
  errorExterno?: string | null;
  deshabilitada?: boolean;
  variante?: "boton" | "zona";
  alCambiarEditorAbierto?: (abierto: boolean) => void;
  contenidoSuperpuesto?: ReactNode;
  claseZona?: string;
  accionesSobreZona?: boolean;
}

const FORMATOS_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];

export default function SubidaImagen({
  valor,
  alCambiar,
  relacionAspecto = 16 / 9,
  formaRecorte = "rectangular",
  tamanoMaximoMb = 5,
  obligatoria = false,
  etiqueta = "Imagen",
  textoAyuda = "PNG, JPG, WebP",
  anchoMaximoCompresion = 2500,
  errorExterno,
  deshabilitada = false,
  variante = "boton",
  alCambiarEditorAbierto,
  contenidoSuperpuesto,
  claseZona = "aspect-video",
  accionesSobreZona = false,
}: SubidaImagenProps) {
  const { pageConfig } = usePageConfig();
  const primario = (pageConfig?.primaryColor as string) || "#06b6d4";
  const secundario = (pageConfig?.secondaryColor as string) || "#ffffff";
  const textoSobreSecundario = getContrastColor(secundario);

  const inputRef = useRef<HTMLInputElement>(null);
  const [imagenFuente, setImagenFuente] = useState("");
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    if (!valor.startsWith("data:")) setImagenFuente("");
  }, [valor]);

  const abrirEditor = () => {
    setEditorAbierto(true);
    alCambiarEditorAbierto?.(true);
  };

  const cerrarEditor = () => {
    setEditorAbierto(false);
    alCambiarEditorAbierto?.(false);
  };

  const abrirArchivo = async (archivo: File) => {
    if (!FORMATOS_PERMITIDOS.includes(archivo.type)) {
      setError("Formato no válido. Usá PNG, JPG o WebP.");
      return;
    }
    if (archivo.size > tamanoMaximoMb * 1024 * 1024) {
      setError(`La imagen supera los ${tamanoMaximoMb}MB`);
      return;
    }

    setProcesando(true);
    setError(null);
    try {
      const base64 = await fileToBase64(
        await compressImage(
          archivo,
          anchoMaximoCompresion,
          anchoMaximoCompresion,
          0.95
        )
      );
      setImagenFuente(base64);
      abrirEditor();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo procesar la imagen"
      );
    } finally {
      setProcesando(false);
    }
  };

  const manejarSeleccion = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) {
      void abrirArchivo(archivo);
    }
    evento.target.value = "";
  };

  const manejarDragEnter = (evento: React.DragEvent) => {
    evento.preventDefault();
    if (procesando || deshabilitada) return;
    setArrastrando(true);
  };

  const manejarDragOver = (evento: React.DragEvent) => {
    evento.preventDefault();
  };

  const manejarDragLeave = (evento: React.DragEvent) => {
    if (evento.currentTarget.contains(evento.relatedTarget as Node)) return;
    setArrastrando(false);
  };

  const manejarDrop = (evento: React.DragEvent) => {
    evento.preventDefault();
    setArrastrando(false);
    if (procesando || deshabilitada) return;
    const archivo = evento.dataTransfer.files?.[0];
    if (archivo) {
      void abrirArchivo(archivo);
    }
  };

  const confirmarRecorte = (resultado: string) => {
    cerrarEditor();
    alCambiar(resultado);
  };

  const reabrirEditor = () => {
    if (imagenFuente) {
      abrirEditor();
      return;
    }
    if (valor.startsWith("data:")) {
      setImagenFuente(valor);
      abrirEditor();
    }
  };

  const puedeEditarRecorte = Boolean(imagenFuente) || valor.startsWith("data:");

  const quitarImagen = () => {
    setImagenFuente("");
    alCambiar("");
  };

  const errorVisible = error || errorExterno;

  const editorRecorte = (
    <EditorRecorte
      abierto={editorAbierto}
      imagen={imagenFuente}
      relacionAspecto={relacionAspecto}
      formaRecorte={formaRecorte}
      alConfirmar={confirmarRecorte}
      alCancelar={cerrarEditor}
    />
  );

  if (variante === "zona") {
    return (
      <div className="space-y-2">
        <div
          className="relative"
          onDragEnter={manejarDragEnter}
          onDragOver={manejarDragOver}
          onDragLeave={manejarDragLeave}
          onDrop={manejarDrop}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={procesando || deshabilitada}
            aria-label="Seleccionar imagen"
            className={`group relative block w-full ${claseZona} overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
            style={{
              borderColor: arrastrando ? primario : primario + "50",
              backgroundColor: arrastrando ? primario + "20" : primario + "08",
              boxShadow: arrastrando
                ? `0 0 0 4px ${primario}33, 0 0 24px ${primario}80`
                : undefined,
            }}
          >
            {valor ? (
              <img src={valor} alt={etiqueta} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <Upload size={32} style={{ color: primario }} />
                <span className="text-sm font-semibold" style={{ color: textoSobreSecundario }}>
                  Seleccionar imagen
                </span>
                <span className="text-xs" style={{ color: textoSobreSecundario + "80" }}>
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
                  style={{ backgroundColor: primario, color: getContrastColor(primario) }}
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
                onClick={() => inputRef.current?.click()}
                disabled={deshabilitada}
                title="Cambiar imagen"
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md transition-colors cursor-pointer"
                style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#ffffff" }}
              >
                <Upload size={12} /> Cambiar
              </button>
              {puedeEditarRecorte && (
                <button
                  type="button"
                  onClick={reabrirEditor}
                  disabled={deshabilitada}
                  title="Editar recorte"
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md transition-colors cursor-pointer"
                  style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#ffffff" }}
                >
                  <Crop size={12} /> Recortar
                </button>
              )}
              <button
                type="button"
                onClick={quitarImagen}
                disabled={deshabilitada}
                title="Quitar imagen"
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md transition-colors cursor-pointer"
                style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#ffffff" }}
              >
                <X size={12} /> Quitar
              </button>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={manejarSeleccion}
          className="sr-only"
          disabled={procesando || deshabilitada}
        />

        {valor && !accionesSobreZona && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={deshabilitada}
              title="Cambiar imagen"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{ color: primario, backgroundColor: primario + "14" }}
            >
              <Upload size={14} /> Cambiar imagen
            </button>
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

        {errorVisible && (
          <p className="text-xs" style={{ color: primario }}>
            {errorVisible}
          </p>
        )}

        {editorRecorte}
      </div>
    );
  }

  return (
    <SubidaImagenBoton
      valor={valor}
      procesando={procesando}
      deshabilitada={deshabilitada}
      puedeEditarRecorte={puedeEditarRecorte}
      etiqueta={etiqueta}
      obligatoria={obligatoria}
      textoAyuda={textoAyuda}
      tamanoMaximoMb={tamanoMaximoMb}
      primario={primario}
      textoSobreSecundario={textoSobreSecundario}
      errorInterno={error}
      errorVisible={errorVisible ?? null}
      inputRef={inputRef}
      editorRecorte={editorRecorte}
      manejarSeleccion={manejarSeleccion}
      reabrirEditor={reabrirEditor}
      quitarImagen={quitarImagen}
    />
  );
}
