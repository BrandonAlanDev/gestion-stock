"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;

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

  return (
    <div
      className="min-h-screen w-full"
      style={
        {
          backgroundColor: fondo,
          color: texto,
          "--admin-primario": primario,
          "--admin-primario-texto": primarioTexto,
          "--admin-primario-suave": primarioSuave,
          "--admin-fondo": fondo,
          "--admin-fondo-opaco": fondoOpaco,
          "--admin-fondo-suave": fondoSuave,
          "--admin-fondo-hover": fondoHover,
          "--admin-borde": borde,
          "--admin-texto": texto,
          "--admin-texto-suave": textoSuave,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
