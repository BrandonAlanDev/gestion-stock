"use client";

import {
  Eye,
  LayoutDashboard,
  LayoutList,
  ListOrdered,
  Palette,
  Save,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

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

function ContenidoWorkspace({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { abrirVistaPrevia } = useVistaPrevia();

  return (
    <div className="w-full min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--admin-texto)]">Diseño del sitio</h1>
              <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">
                Personalizá la identidad, el contenido y la estructura de tu tienda desde un solo lugar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  router.refresh();
                  toast.success("Cambios guardados");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-borde)] px-4 py-2 text-sm font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]"
              >
                <Save size={16} />
                Guardar cambios
              </button>
              <button
                onClick={() => abrirVistaPrevia()}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90"
              >
                <Eye size={16} />
                Vista previa
              </button>
            </div>
          </div>
          <div className="mt-4">
            <Tabs elementos={PESTANAS} activo={pathname} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
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
