"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";

export interface ColoresTema {
  primario: string;
  secundario: string;
  fondo: string;
}

const VALORES_POR_DEFECTO: ColoresTema = {
  primario: "#06b6d4",
  secundario: "#ffffff",
  fondo: "#09090b",
};

function extraerConfigAnidada(
  config: Record<string, unknown>
): Record<string, unknown> {
  const anidada = config.pageConfig;
  if (anidada && typeof anidada === "object") {
    return anidada as Record<string, unknown>;
  }
  return config;
}

function colorValido(valor: unknown, fallback: string): string {
  return typeof valor === "string" && esColorHexValido(valor) ? valor : fallback;
}

export function useColoresTema(): ColoresTema {
  const { pageConfig } = usePageConfig();
  const config = extraerConfigAnidada(pageConfig);

  return {
    primario: colorValido(config.primaryColor, VALORES_POR_DEFECTO.primario),
    secundario: colorValido(config.secondaryColor, VALORES_POR_DEFECTO.secundario),
    fondo: colorValido(config.bgColor, VALORES_POR_DEFECTO.fondo),
  };
}
