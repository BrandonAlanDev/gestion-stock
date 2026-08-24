"use client";

import { getContrastColor } from "@/lib/utils";
import SubidaImagen from "@/components/imagen/SubidaImagen";

interface ZonaImagenSlideProps {
  imagen: string;
  alCambiarImagen: (valor: string) => void;
  deshabilitada: boolean;
  alCambiarEditorAbierto: (abierto: boolean) => void;
  showText: boolean;
  hideButton: boolean;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  textoBoton: string;
  url: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export default function ZonaImagenSlide({
  imagen,
  alCambiarImagen,
  deshabilitada,
  alCambiarEditorAbierto,
  showText,
  hideButton,
  titulo,
  subtitulo,
  descripcion,
  textoBoton,
  url,
  primaryColor,
  textColor,
}: ZonaImagenSlideProps) {
  const mostrarPreview = Boolean(imagen && showText);

  const contenidoSuperpuesto = mostrarPreview ? (
    <div className="h-full w-full">
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05))" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 70%)" }} />
      <div className="relative flex h-full w-full flex-col items-center justify-end p-4 sm:p-5 text-center">
        <div className="space-y-1.5">
          {subtitulo && (
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/80">
              {subtitulo}
            </p>
          )}
          {titulo && (
            <h3 className="text-base sm:text-xl font-bold leading-tight text-white line-clamp-2">
              {titulo}
            </h3>
          )}
          {descripcion && (
            <p className="text-xs sm:text-sm text-white/85 line-clamp-2">
              {descripcion}
            </p>
          )}
          {!hideButton && (textoBoton || url) && (
            <span
              className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold"
              style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
            >
              {textoBoton || "Ver más"}
            </span>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-3">
      <SubidaImagen
        valor={imagen}
        alCambiar={alCambiarImagen}
        relacionAspecto={16 / 9}
        tamanoMaximoMb={5}
        obligatoria
        etiqueta="Imagen de portada"
        textoAyuda="PNG, JPG, WebP"
        variante="zona"
        deshabilitada={deshabilitada}
        alCambiarEditorAbierto={alCambiarEditorAbierto}
        contenidoSuperpuesto={contenidoSuperpuesto ?? undefined}
      />
      <p className="text-xs" style={{ color: textColor + "60" }}>
        {imagen ? "Vista previa aproximada del slide" : "La imagen es obligatoria"}
      </p>
    </div>
  );
}
