"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { Check, X } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";
import { generarImagenRecortada } from "./utilidades-recorte";
import type { FormaRecorte } from "./tipos";

interface EditorRecorteProps {
  abierto: boolean;
  imagen: string;
  relacionAspecto?: number;
  formaRecorte?: FormaRecorte;
  alConfirmar: (resultado: string) => void;
  alCancelar: () => void;
}

export default function EditorRecorte({
  abierto,
  imagen,
  relacionAspecto = 16 / 9,
  formaRecorte = "rectangular",
  alConfirmar,
  alCancelar,
}: EditorRecorteProps) {
  const { pageConfig } = usePageConfig();
  const primario = (pageConfig?.primaryColor as string) || "#06b6d4";
  const secundario = (pageConfig?.secondaryColor as string) || "#ffffff";
  const textoSobreSecundario = getContrastColor(secundario);

  const [recorte, setRecorte] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixeles, setAreaPixeles] = useState<Area | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alCambioArea = useCallback((_area: Area, areaPixeles: Area) => {
    setAreaPixeles(areaPixeles);
  }, []);

  const confirmar = async () => {
    if (!areaPixeles) {
      setError("Ajustá el recorte antes de confirmar");
      return;
    }
    setProcesando(true);
    setError(null);
    try {
      const resultado = await generarImagenRecortada(imagen, areaPixeles, formaRecorte);
      alConfirmar(resultado);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo recortar la imagen"
      );
    } finally {
      setProcesando(false);
    }
  };

  if (!abierto) return null;

  const modal = (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: secundario,
          color: textoSobreSecundario,
          borderColor: primario,
        }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: textoSobreSecundario + "22" }}
        >
          <h3 className="text-lg font-black uppercase">Ajustar imagen</h3>
          <button
            type="button"
            onClick={alCancelar}
            aria-label="Cancelar recorte"
            className="p-2 rounded-lg cursor-pointer transition-opacity hover:opacity-70"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative w-full h-72 sm:h-80 bg-black">
          <Cropper
            image={imagen}
            crop={recorte}
            zoom={zoom}
            aspect={relacionAspecto}
            cropShape={formaRecorte === "redondeada" ? "round" : "rect"}
            showGrid
            onCropChange={setRecorte}
            onZoomChange={setZoom}
            onCropComplete={alCambioArea}
          />
        </div>

        <div className="p-4 space-y-3">
          <label className="flex items-center gap-3 text-sm">
            <span className="font-medium">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(evento) => setZoom(Number(evento.target.value))}
              className="flex-1 cursor-pointer"
            />
          </label>

          {error && (
            <p className="text-sm" style={{ color: primario }}>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={alCancelar}
              className="px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              style={{
                border: `1px solid ${textoSobreSecundario}30`,
                color: textoSobreSecundario + "99",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={procesando}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-opacity disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: primario,
                color: getContrastColor(primario),
              }}
            >
              {procesando ? (
                "Procesando..."
              ) : (
                <>
                  <Check size={16} /> Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
