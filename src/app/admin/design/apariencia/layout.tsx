"use client";

import {
  Palette,
  Sparkles,
  Store,
  Type,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

const OPCIONES: { href: string; etiqueta: string; icono: LucideIcon }[] = [
  {
    href: "/admin/design/apariencia",
    etiqueta: "Identidad",
    icono: Store,
  },
  {
    href: "/admin/design/apariencia/colores",
    etiqueta: "Colores",
    icono: Palette,
  },
  {
    href: "/admin/design/apariencia/tipografia",
    etiqueta: "Tipografía",
    icono: Type,
  },
  {
    href: "/admin/design/apariencia/estilo",
    etiqueta: "Estilo",
    icono: Sparkles,
  },
];

export default function AparienciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--admin-texto-suave)]">
        Acá definís la identidad visual de tu tienda. Cada bloque se guarda
        por separado.
      </p>

      <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
        <nav
          aria-label="Secciones de apariencia"
          className="flex gap-1 overflow-x-auto self-start lg:sticky lg:top-20 lg:flex-col"
        >
          {OPCIONES.map((opcion) => {
            const Icono = opcion.icono;
            const activa = opcion.href === pathname;

            return (
              <Link
                key={opcion.href}
                href={opcion.href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                  activa
                    ? "bg-[var(--admin-primario-suave)] font-semibold text-[var(--admin-primario)]"
                    : "text-[var(--admin-texto-suave)] hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
                )}
              >
                <Icono size={16} className="shrink-0" />
                {opcion.etiqueta}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
