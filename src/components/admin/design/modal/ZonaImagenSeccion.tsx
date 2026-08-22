"use client";

import SubidaImagen from "@/components/imagen/SubidaImagen";
import { getContrastColor } from "@/lib/utils";
import type { DatosTarjeta } from "./tipos";

interface ZonaImagenSeccionProps {
  datos: DatosTarjeta;
  relacionAspecto: number;
  deshabilitada: boolean;
  alCambiarEditorAbierto: (abierto: boolean) => void;
  alCambiarImagen: (valor: string) => void;
  primaryColor: string;
  textColor: string;
}

export default function ZonaImagenSeccion({
  datos,
  relacionAspecto,
  deshabilitada,
  alCambiarEditorAbierto,
  alCambiarImagen,
  primaryColor,
  textColor,
}: ZonaImagenSeccionProps) {
  const bgBoton = datos.buttonBgColor || primaryColor;
  const colorBoton = datos.buttonTextColor || getContrastColor(bgBoton);

  const clasesBoton = (() => {
    const base = "px-8 py-3 font-black uppercase tracking-wider text-sm";
    switch (datos.buttonVariant) {
      case "STRAIGHT":
        return `${base} rounded-none`;
      case "TRANSPARENT":
        return `${base} rounded-xl bg-transparent border-2`;
      default:
        return `${base} rounded-xl`;
    }
  })();

  const estiloBoton = datos.buttonVariant === "TRANSPARENT"
    ? { color: colorBoton, borderColor: bgBoton, backgroundColor: "transparent" }
    : { backgroundColor: bgBoton, color: colorBoton };

  const contenidoSuperpuesto = datos.image ? (
    <div className="h-full w-full">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.05))",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
        {datos.title ? (
          <h3 className="text-white font-black text-2xl md:text-3xl tracking-tighter uppercase italic leading-none">
            {datos.title}
          </h3>
        ) : null}
        {datos.subtitle ? (
          datos.subtitleDim ? (
            <p className="text-sm text-white/70 opacity-70 mb-2">{datos.subtitle}</p>
          ) : (
            <p
              className="text-[10px] font-black tracking-[0.35em] uppercase mb-2"
              style={{
                color: primaryColor,
                ...(datos.subtitleNeon
                  ? { textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}80` }
                  : {}),
              }}
            >
              {datos.subtitle}
            </p>
          )
        ) : null}
        {datos.linkStyle === "BUTTON" ? (
          <div className="mt-4">
            <span className={clasesBoton} style={estiloBoton}>
              {datos.buttonText || "Ver más"}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-2">
      <SubidaImagen
        valor={datos.image}
        alCambiar={alCambiarImagen}
        relacionAspecto={relacionAspecto}
        obligatoria
        etiqueta="Imagen de la sección"
        textoAyuda="PNG, JPG, WebP"
        variante="zona"
        claseZona={relacionAspecto === 4 / 3 ? "aspect-[4/3]" : "aspect-[16/10]"}
        deshabilitada={deshabilitada}
        alCambiarEditorAbierto={alCambiarEditorAbierto}
        contenidoSuperpuesto={contenidoSuperpuesto ?? undefined}
        accionesSobreZona
      />
      <p className="text-xs" style={{ color: textColor + "60" }}>
        Vista previa aproximada
      </p>
    </div>
  );
}
