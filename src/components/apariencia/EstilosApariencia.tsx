"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getPageConfig } from "@/actions/page-config/general.actions";
import { aplicarTipografiaDocumento } from "@/lib/apariencia/aplicar-tipografia-documento";
import { obtenerVariablesTema } from "@/lib/apariencia/obtener-variables-tema";

export default function EstilosApariencia() {
  const pathname = usePathname();

  useEffect(() => {
    let activo = true;

    void getPageConfig().then((resultado) => {
      if (!activo || !resultado.ok || !resultado.pageConfig) return;

      const variablesTema = obtenerVariablesTema(
        resultado.pageConfig as Record<string, unknown>,
      );

      for (const [clave, valor] of Object.entries(variablesTema)) {
        document.documentElement.style.setProperty(clave, valor);
      }

      const principal =
        typeof resultado.pageConfig.fontPrimary === "string"
          ? resultado.pageConfig.fontPrimary
          : "Outfit";

      const secundaria =
        typeof resultado.pageConfig.fontSecondary === "string"
          ? resultado.pageConfig.fontSecondary
          : "Playfair Display";

      aplicarTipografiaDocumento(principal, secundaria);
    });

    return () => {
      activo = false;
    };
  }, [pathname]);

  return null;
}
