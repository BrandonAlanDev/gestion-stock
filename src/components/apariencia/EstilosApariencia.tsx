"use client";

import { useEffect, useRef } from "react";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { obtenerVariablesTema } from "@/lib/apariencia/obtener-variables-tema";

const FUENTES_BASE = new Set(["Outfit", "Playfair Display"]);

export default function EstilosApariencia() {
  const { pageConfig } = usePageConfig();
  const linksCargados = useRef(new Map<string, HTMLLinkElement>());

  const fontPrimary =
    typeof pageConfig.fontPrimary === "string"
      ? pageConfig.fontPrimary
      : "Outfit";

  const fontSecondary =
    typeof pageConfig.fontSecondary === "string"
      ? pageConfig.fontSecondary
      : "Playfair Display";

  useEffect(() => {
    const variablesTema = obtenerVariablesTema(pageConfig);
    for (const [clave, valor] of Object.entries(variablesTema)) {
      document.documentElement.style.setProperty(clave, valor);
    }

    document.documentElement.style.setProperty(
      "--fuente-principal",
      `'${fontPrimary}', sans-serif`,
    );

    document.documentElement.style.setProperty(
      "--fuente-secundaria",
      `'${fontSecondary}', serif`,
    );

    const fuentesNecesarias = new Set(
      [fontPrimary, fontSecondary].filter(
        (fuente) => !FUENTES_BASE.has(fuente),
      ),
    );

    for (const [fuente, link] of linksCargados.current) {
      if (!fuentesNecesarias.has(fuente)) {
        link.remove();
        linksCargados.current.delete(fuente);
      }
    }

    for (const fuente of fuentesNecesarias) {
      if (linksCargados.current.has(fuente)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fuente.replaceAll(" ", "+")}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
      linksCargados.current.set(fuente, link);
    }
  }, [fontPrimary, fontSecondary, pageConfig]);

  return null;
}
