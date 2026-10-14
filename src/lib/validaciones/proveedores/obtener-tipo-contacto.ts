import { esquemaCorreo } from "@/lib/validaciones/esquemas";

export function obtenerTipoContacto(contacto: string): "EMAIL" | "PHONE" {
  return esquemaCorreo.safeParse(contacto).success ? "EMAIL" : "PHONE";
}
