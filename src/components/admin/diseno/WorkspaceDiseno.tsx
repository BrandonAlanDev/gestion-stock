"use client";

import {
  ChevronDown,
  Eye,
  LayoutDashboard,
  LayoutList,
  ListOrdered,
  Palette,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Tabs from "@/components/ui/tabs";
import PanelVistaPrevia from "./PanelVistaPrevia";
import ProveedorVistaPrevia from "./proveedor-vista-previa";
import useVistaPrevia from "./use-vista-previa";

const PESTANAS: {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  activoPrefijo?: string;
}[] = [
    { href: "/admin/design", etiqueta: "Resumen", icono: LayoutDashboard },
    {
      href: "/admin/design/apariencia",
      etiqueta: "Apariencia",
      icono: Palette,
      activoPrefijo: "/admin/design/apariencia",
    },
    { href: "/admin/design/contenido", etiqueta: "Contenido", icono: LayoutList },
    { href: "/admin/design/estructura", etiqueta: "Estructura", icono: ListOrdered },
  ];

const SECCIONES_MOVILES = [
  { href: "/admin/design", etiqueta: "Resumen" },
  { href: "/admin/design/apariencia", etiqueta: "Apariencia · Identidad" },
  { href: "/admin/design/apariencia/colores", etiqueta: "Apariencia · Colores" },
  { href: "/admin/design/apariencia/tipografia", etiqueta: "Apariencia · Tipografía" },
  { href: "/admin/design/apariencia/estilo", etiqueta: "Apariencia · Estilo" },
  { href: "/admin/design/contenido", etiqueta: "Contenido" },
  { href: "/admin/design/estructura", etiqueta: "Estructura" },
] as const;

function ContenidoWorkspace({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const seccionActual = SECCIONES_MOVILES.find((seccion) => seccion.href === pathname);
  const { abrirVistaPrevia } = useVistaPrevia();

  return (
    <div className="min-h-screen w-full">
      <header>
        <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--admin-texto)]">Diseño de la tienda</h1>
              <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">
                Personalizá la identidad, el contenido y la estructura de tu tienda desde un solo lugar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => abrirVistaPrevia()}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90"
              >
                <Eye size={16} />
                Vista previa
              </button>
            </div>
          </div>
          <div className="mt-6 min-w-0 max-w-full lg:hidden">
            <details
              key={pathname}
              className="group relative min-w-0 max-w-full"
            >
              <summary className="flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] px-3 py-2 text-sm font-medium text-[var(--admin-texto)] focus-visible:outline-2 focus-visible:outline-[var(--admin-primario)] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate">Sección de diseño: {seccionActual?.etiqueta ?? "Resumen"}</span>
                <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-[var(--admin-texto-suave)] transition-transform group-open:rotate-180" />
              </summary>
              <nav aria-label="Secciones de diseño" className="absolute left-0 top-full z-30 mt-2 max-h-[50dvh] w-full min-w-0 overflow-y-auto rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-1 shadow-lg">
                {SECCIONES_MOVILES.map((seccion) => (
                  <Link
                    key={seccion.href}
                    href={seccion.href}
                    aria-current={seccion.href === pathname ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-md px-3 py-2 text-sm ${seccion.href === pathname ? "bg-[var(--admin-primario-suave)] font-semibold text-[var(--admin-primario)]" : "text-[var(--admin-texto)] hover:bg-[var(--admin-fondo-hover)]"}`}
                  >
                    {seccion.etiqueta}
                  </Link>
                ))}
              </nav>
            </details>
          </div>
          <div className="mt-6 hidden lg:block">
            <Tabs elementos={PESTANAS} activo={pathname} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default function WorkspaceDiseno({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProveedorVistaPrevia>
      <ContenidoWorkspace>{children}</ContenidoWorkspace>
      <PanelVistaPrevia />
    </ProveedorVistaPrevia>
  );
}
