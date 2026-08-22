import type {
  ConfigApariencia,
  ConfigAparienciaEntrada,
} from "@/components/admin/diseno/apariencia/tipos-apariencia";

export function normalizarConfigApariencia(
  config: ConfigAparienciaEntrada
): ConfigApariencia {
  return {
    storeName: config?.storeName || "GestionOK",
    slogan: config?.slogan ?? null,
    description: config?.description ?? null,
    logo: config?.logo ?? null,
    favicon: config?.favicon ?? null,
    primaryColor: config?.primaryColor || "#06b6d4",
    secondaryColor: config?.secondaryColor || "#ffffff",
    bgColor: config?.bgColor || "#09090b",
    fontPrimary: config?.fontPrimary || "Outfit",
    fontSecondary: config?.fontSecondary || "Playfair Display",
    borderRadius: config?.borderRadius || "redondeado",
    shadowLevel: config?.shadowLevel || "sutil",
    density: config?.density || "comoda",
  };
}
