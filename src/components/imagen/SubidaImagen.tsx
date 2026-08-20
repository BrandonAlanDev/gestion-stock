"use client";

import { useEffect, useRef, useState } from "react";
import { Crop, Upload, X } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { compressImage } from "@/lib/image-utils";
import { fileToBase64, getContrastColor } from "@/lib/utils";
import EditorRecorte from "./EditorRecorte";
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
  anchoMaximoCompresion = 1200,
  errorExterno,
  deshabilitada = false,
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

  useEffect(() => {
    if (!valor.startsWith("data:")) setImagenFuente("");
  }, [valor]);

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
      const esPng = archivo.type === "image/png";
      const base64 = esPng
        ? await fileToBase64(archivo)
        : await fileToBase64(
            await compressImage(
              archivo,
              anchoMaximoCompresion,
              anchoMaximoCompresion,
              0.8
            )
          );
      setImagenFuente(base64);
      setEditorAbierto(true);
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

  const confirmarRecorte = (resultado: string) => {
    setEditorAbierto(false);
    alCambiar(resultado);
  };

  const reabrirEditor = () => {
    if (imagenFuente) {
      setEditorAbierto(true);
      return;
    }
    if (valor.startsWith("data:")) {
      setImagenFuente(valor);
      setEditorAbierto(true);
    }
  };

  const puedeEditarRecorte = Boolean(imagenFuente) || valor.startsWith("data:");

  const quitarImagen = () => {
    setImagenFuente("");
    alCambiar("");
  };

  const errorVisible = error || errorExterno;

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

      {!valor && !error && (
        <p className="text-xs" style={{ color: textoSobreSecundario + "60" }}>
          {textoAyuda} · máx {tamanoMaximoMb}MB
        </p>
      )}
      {errorVisible && (
        <p className="text-xs" style={{ color: primario }}>
          {errorVisible}
        </p>
      )}

      <EditorRecorte
        abierto={editorAbierto}
        imagen={imagenFuente}
        relacionAspecto={relacionAspecto}
        formaRecorte={formaRecorte}
        alConfirmar={confirmarRecorte}
        alCancelar={() => setEditorAbierto(false)}
      />
    </div>
  );
}
