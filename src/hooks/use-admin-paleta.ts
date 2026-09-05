"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

export function useAdminPaleta() {
  const { pageConfig } = usePageConfig();

  const fondo = (pageConfig?.secondaryColor as string) || "#FFFFFF";
  const texto = getContrastColor(fondo);
  const esOscuro = texto === "#ffffff";
  const primario = (pageConfig?.primaryColor as string) || "#06b6d4";
  const sobrePrimario = getContrastColor(primario);

  return {
    fondo,
    texto,
    esOscuro,
    primario,
    sobrePrimario,
    textoSuave: texto + "B3",
    borde: texto + "2E",
    fondoSuave: texto + "0D",
    fondoHover: texto + "1A",
  };
}
