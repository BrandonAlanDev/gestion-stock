"use client";

import { useEffect } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;

interface VariablesAdmin {
  primario: string;
  primarioTexto: string;
  primarioSuave: string;
  fondo: string;
  fondoOpaco: string;
  fondoSuave: string;
  fondoHover: string;
  borde: string;
  texto: string;
  textoSuave: string;
}

function construirVariablesAdmin(variables: VariablesAdmin): Record<string, string> {
  return {
    "--admin-primario": variables.primario,
    "--admin-primario-texto": variables.primarioTexto,
    "--admin-primario-suave": variables.primarioSuave,
    "--admin-fondo": variables.fondo,
    "--admin-fondo-opaco": variables.fondoOpaco,
    "--admin-fondo-suave": variables.fondoSuave,
    "--admin-fondo-hover": variables.fondoHover,
    "--admin-borde": variables.borde,
    "--admin-texto": variables.texto,
    "--admin-texto-suave": variables.textoSuave,
  };
}

export default function ProveedorColoresAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pageConfig } = usePageConfig();

  const primario =
    typeof pageConfig.primaryColor === "string" &&
    HEX_VALIDO.test(pageConfig.primaryColor)
      ? pageConfig.primaryColor
      : "#06b6d4";
  const fondo =
    typeof pageConfig.bgColor === "string" && HEX_VALIDO.test(pageConfig.bgColor)
      ? pageConfig.bgColor
      : "#09090b";

  const texto = getContrastColor(fondo);
  const primarioTexto = getContrastColor(primario);
  const textoSuave = texto + "B3";
  const borde = texto + "2E";
  const fondoSuave = texto + "0D";
  const fondoHover = texto + "1A";
  const fondoOpaco = fondo + "E6";
  const primarioSuave = primario + "26";

  useEffect(() => {
    const raiz = document.documentElement;
    const variables: VariablesAdmin = {
      primario,
      primarioTexto,
      primarioSuave,
      fondo,
      fondoOpaco,
      fondoSuave,
      fondoHover,
      borde,
      texto,
      textoSuave,
    };
    Object.entries(construirVariablesAdmin(variables)).forEach(([clave, valor]) => {
      raiz.style.setProperty(clave, valor);
    });
  }, [primario, primarioTexto, primarioSuave, fondo, fondoOpaco, fondoSuave, fondoHover, borde, texto, textoSuave]);

  return (
    <div
      className="min-h-screen w-full"
      style={
        {
          backgroundColor: fondo,
          color: texto,
          ...construirVariablesAdmin({
            primario,
            primarioTexto,
            primarioSuave,
            fondo,
            fondoOpaco,
            fondoSuave,
            fondoHover,
            borde,
            texto,
            textoSuave,
          }),
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
