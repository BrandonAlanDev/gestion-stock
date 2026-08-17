import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";
import { aclararColor } from "@/lib/contraste/aclarar-color";
import { getContrastColor } from "@/lib/utils";

function colorValido(valor: unknown, fallback: string): string {
  return typeof valor === "string" && esColorHexValido(valor) ? valor : fallback;
}

export function obtenerVariablesTema(
  pageConfig: Record<string, unknown>
): Record<string, string> {
  const primario = colorValido(pageConfig.primaryColor, "#06b6d4");
  const secundario = colorValido(pageConfig.secondaryColor, "#ffffff");
  const fondo = colorValido(pageConfig.bgColor, "#09090b");

  return {
    "--color-primario": primario,
    "--color-secundario": secundario,
    "--color-fondo-sitio": fondo,
    "--texto-sobre-primario": getContrastColor(primario),
    "--texto-sobre-secundario": getContrastColor(secundario),
    "--texto-sobre-fondo": getContrastColor(fondo),
    "--superficie-fondo": aclararColor(fondo, 0.06),
    "--superficie-imagen": "#ffffff",
  };
}
