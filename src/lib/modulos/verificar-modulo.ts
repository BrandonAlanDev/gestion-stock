import { moduloHabilitado, type ClaveModulo } from "@/lib/modulos/modulo-habilitado";
import { notFound } from "next/navigation";

export async function verificarModuloHabilitado(clave: ClaveModulo): Promise<void> {
  if (!(await moduloHabilitado(clave))) {
    notFound();
  }
}
