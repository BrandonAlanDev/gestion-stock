"use client";

import SeccionBanners from "./SeccionBanners";
import SeccionColores from "./SeccionColores";
import SeccionEstilo from "./SeccionEstilo";
import SeccionIdentidad from "./SeccionIdentidad";
import SeccionTipografia from "./SeccionTipografia";
import {
  ConfigApariencia,
  ConfigAparienciaEntrada,
} from "./tipos-apariencia";

function normalizarConfig(
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
    fontPrimary: config?.fontPrimary || "Outfit",
    fontSecondary: config?.fontSecondary || "Playfair Display",
    borderRadius: config?.borderRadius || "redondeado",
    shadowLevel: config?.shadowLevel || "sutil",
    density: config?.density || "comoda",
    banners: config?.banners ?? [],
  };
}

export default function EditorApariencia({
  config,
}: {
  config: ConfigAparienciaEntrada;
}) {
  if (config === null) {
    return (
      <p className="text-sm text-[var(--admin-texto-suave)]">
        No se pudo cargar la configuración
      </p>
    );
  }

  const normalizado = normalizarConfig(config);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--admin-texto-suave)]">
        Acá definís la identidad visual de tu tienda. Cada bloque se
        guarda por separado.
      </p>

      <SeccionIdentidad config={normalizado} />
      <SeccionColores config={normalizado} />
      <SeccionTipografia config={normalizado} />
      <SeccionEstilo config={normalizado} />
      <SeccionBanners config={normalizado} />
    </div>
  );
}
