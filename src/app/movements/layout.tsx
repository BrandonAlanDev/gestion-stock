import type { ReactNode } from "react";
import LayoutGestion from "@/components/layout/LayoutGestion";

export default function MovimientosLayout({ children }: { children: ReactNode }) {
  return <LayoutGestion>{children}</LayoutGestion>;
}
