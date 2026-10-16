"use client";

import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { ContextoTemaAdmin } from "@/contextos/admin/contexto-tema-admin";
import { compressImage } from "@/lib/image-utils";
import { convertirArchivoBase64 as fileToBase64 } from "@/lib/utilidades/convertir-archivo-base64";
import { obtenerColorContraste as getContrastColor } from "@/lib/utilidades/obtener-color-contraste";
import EditorRecorte from "./EditorRecorte";
import SubidaImagenBoton from "./SubidaImagenBoton";
import SubidaImagenZona from "./SubidaImagenZona";
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
  const temaAdmin = useContext(ContextoTemaAdmin);
  const adminActivo = temaAdmin !== null;
  const { pageConfig } = usePageConfig();
  const primario = adminActivo
    ? "var(--admin-primario)"
    : (pageConfig?.primaryColor as string) || "#06b6d4";
  const secundario = adminActivo
    ? "var(--admin-secundario-suave)"
    : (pageConfig?.secondaryColor as string) || "#ffffff";
  const textoSobreSecundario = adminActivo
    ? "var(--admin-texto)"
    : getContrastColor(secundario);
  const colorAyuda = adminActivo
    ? "var(--admin-texto-suave)"
    : textoSobreSecundario + "80";

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
      <SubidaImagenZona
        valor={valor}
        etiqueta={etiqueta}
        claseZona={claseZona}
        procesando={procesando}
        deshabilitada={deshabilitada}
        arrastrando={arrastrando}
        textoAyuda={textoAyuda}
        tamanoMaximoMb={tamanoMaximoMb}
        primario={primario}
        textoSobreSecundario={textoSobreSecundario}
        colorAyuda={colorAyuda}
        adminActivo={adminActivo}
        errorVisible={errorVisible}
        contenidoSuperpuesto={contenidoSuperpuesto}
        accionesSobreZona={accionesSobreZona}
        puedeEditarRecorte={puedeEditarRecorte}
        referenciaEntrada={inputRef}
        editorRecorte={editorRecorte}
        alSeleccionar={manejarSeleccion}
        alEntrarArrastre={manejarDragEnter}
        alArrastrarSobre={manejarDragOver}
        alSalirArrastre={manejarDragLeave}
        alSoltar={manejarDrop}
        alAbrirSelector={() => inputRef.current?.click()}
        alAbrirRecorte={reabrirEditor}
        alQuitar={quitarImagen}
      />
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
      adminActivo={adminActivo}
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
