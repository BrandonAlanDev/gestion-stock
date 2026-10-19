"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ExternalLink, Menu } from "lucide-react";
import BotonTemaAdmin from "@/components/admin/tema/BotonTemaAdmin";

const nombres: Record<string, string> = {
  "/admin": "Inicio",
  "/admin/dashboard": "Inicio",
  "/admin/productos": "Productos",
  "/admin/categories": "Categorías",
  "/admin/provider": "Proveedores",
  "/admin/sizes": "Talles",
  "/admin/movements": "Movimientos",
  "/admin/design": "Diseño de la tienda",
  "/admin/design/apariencia": "Diseño · Apariencia",
  "/admin/design/contenido": "Diseño · Contenido",
  "/admin/design/estructura": "Diseño · Estructura",
  "/admin/custom-page": "Páginas",
  "/admin/pageConfig": "Configuración",
};

export default function AdminHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const seccion = Object.entries(nombres)
    .filter(([ruta]) => pathname === ruta || pathname.startsWith(`${ruta}/`))
    .sort(([a], [b]) => b.length - a.length)[0]?.[1] ?? "Administración";

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[var(--sidebar-ancho)] z-[90] h-14 border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] transition-[left] duration-200">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onOpenMenu} aria-label="Abrir menú" className="-ml-1 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--admin-texto)] hover:bg-[var(--admin-fondo-hover)] md:hidden">
            <Menu size={20} />
          </button>
          <span className="truncate text-sm font-semibold text-[var(--admin-texto)]">{seccion}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--admin-texto-suave)] hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]">
            <ExternalLink size={15} />
            <span className="hidden sm:inline">Ver tienda</span>
          </Link>
          <BotonTemaAdmin compacto />
          <span title={session?.user?.name ?? "Cuenta"} className="ml-1 flex size-8 items-center justify-center rounded-md bg-[var(--admin-primario-suave)] text-xs font-semibold text-[var(--admin-primario)]">
            {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
          </span>
        </div>
      </div>
    </header>
  );
}
