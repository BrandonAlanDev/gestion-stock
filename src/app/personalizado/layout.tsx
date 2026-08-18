import { verificarModuloHabilitado } from "@/lib/modulos/verificar-modulo";
import type { ReactNode } from "react";

export default async function PersonalizadoLayout({ children }: { children: ReactNode }) {
  await verificarModuloHabilitado("personalizadoEnabled");
  return <>{children}</>;
}
