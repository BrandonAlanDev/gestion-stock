import { verificarModuloHabilitado } from "@/lib/modulos/verificar-modulo";
import type { ReactNode } from "react";

export default async function ArreglosLayout({ children }: { children: ReactNode }) {
  await verificarModuloHabilitado("arreglosEnabled");
  return <>{children}</>;
}
