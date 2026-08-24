import { verificarModuloHabilitado } from "@/lib/modulos/verificar-modulo";
import type { ReactNode } from "react";

export default async function PlanDeAhorroLayout({ children }: { children: ReactNode }) {
  await verificarModuloHabilitado("planAhorroEnabled");
  return <>{children}</>;
}
