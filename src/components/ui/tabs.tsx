import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

interface ElementoTab {
  href: string;
  etiqueta: string;
  icono?: LucideIcon;
  activoPrefijo?: string;
}

interface TabsProps {
  elementos: ElementoTab[];
  activo: string;
}

export default function Tabs({ elementos, activo }: TabsProps) {
  return (
    <nav aria-label="Secciones de diseño" className="flex gap-1 overflow-x-auto border-b border-[var(--admin-borde)]">
      {elementos.map((elemento) => {
        const Icono = elemento.icono;
        const esActivo =
          elemento.href === activo ||
          (elemento.activoPrefijo
            ? activo.startsWith(elemento.activoPrefijo)
            : false);
        return (
          <Link
            key={elemento.href}
            href={elemento.href}
            aria-current={esActivo ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
              esActivo
                ? "border-[var(--admin-primario)] text-[var(--admin-texto)]"
                : "border-transparent text-[var(--admin-texto-suave)] hover:text-[var(--admin-texto)]"
            )}
          >
            {Icono && (
              <Icono size={16} className={esActivo ? "text-[var(--admin-primario)]" : undefined} />
            )}
            {elemento.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
