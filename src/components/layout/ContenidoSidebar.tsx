"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, ClipboardList, History, Home, LayoutTemplate, LogOut, Package, Ruler, Settings, Store, Tags, Truck, X } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";

const grupos = [
  { titulo: "General", enlaces: [
    { href: "/admin", etiqueta: "Inicio", icono: Home },
    { href: "/admin/productos", etiqueta: "Productos", icono: Package },
    { href: "/admin/categories", etiqueta: "Categorías", icono: Tags },
    { href: "/admin/provider", etiqueta: "Proveedores", icono: Truck },
    { href: "/admin/sizes", etiqueta: "Talles", icono: Ruler },
    { href: "/admin/movements", etiqueta: "Movimientos", icono: History },
    { href: "/admin/orders", etiqueta: "Pedidos", icono: ClipboardList },
    { href: "/admin/envios", etiqueta: "Envíos", icono: Truck },
    { href: "/admin/transportistas", etiqueta: "Transportistas", icono: Truck },
  ] },
  { titulo: "Tienda online", enlaces: [
    { href: "/admin/design", etiqueta: "Diseño", icono: LayoutTemplate },
    { href: "/admin/custom-page", etiqueta: "Páginas", icono: Store },
    { href: "/admin/pageConfig", etiqueta: "Configuración", icono: Settings },
  ] },
];

interface ContenidoSidebarProps {
  colapsado?: boolean;
  onNavegar?: () => void;
  onToggleColapsado?: () => void;
}

export default function ContenidoSidebar({ colapsado = false, onNavegar, onToggleColapsado }: ContenidoSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const pageConfig = usePageConfig();
  const logo = pageConfig?.pageConfig?.logo;
  const nombre = pageConfig?.pageConfig?.storeName || "Mi tienda";

  const cerrarSesion = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <>
      <div className={`flex min-h-12 items-center gap-2 px-2 ${colapsado ? "justify-center" : "justify-between"}`}>
        <Link href="/admin" onClick={onNavegar} className="flex min-w-0 items-center gap-2.5" title={nombre}>
          {typeof logo === "string" && logo ? (
            <Image src={logo} alt="" width={32} height={32} unoptimized={!imagenAdmiteOptimizacion(logo)} className="size-8 shrink-0 rounded-md object-cover" />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--admin-primario)] text-sm font-bold text-[var(--admin-primario-texto)]">{nombre[0]?.toUpperCase() ?? "T"}</span>
          )}
          {!colapsado && <span className="truncate text-sm font-semibold text-[var(--admin-texto)]">{nombre}</span>}
        </Link>
        {!colapsado && onNavegar && <button type="button" onClick={onNavegar} className="p-1.5 text-[var(--admin-texto-suave)]" aria-label="Cerrar menú"><X size={18} /></button>}
      </div>

      <nav aria-label="Administración" className="mt-6 flex-1 space-y-6">
        {grupos.map((grupo) => (
          <div key={grupo.titulo}>
            {!colapsado && <p className="mb-1 px-3 text-xs font-medium text-[var(--admin-texto-suave)]">{grupo.titulo}</p>}
            <div className="space-y-0.5">
              {grupo.enlaces.map(({ href, etiqueta, icono: Icono }) => {
                const activo = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) || (href === "/admin" && pathname === "/admin/dashboard");
                return (
                  <Link key={href} href={href} onClick={onNavegar} title={etiqueta} aria-current={activo ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${colapsado ? "justify-center" : ""} ${activo ? "bg-[var(--admin-primario-suave)] font-semibold text-[var(--admin-primario)]" : "text-[var(--admin-texto-suave)] hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"}`}>
                    <Icono size={18} strokeWidth={1.8} className="shrink-0" />
                    {!colapsado && <span>{etiqueta}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-[var(--admin-borde)] pt-3">
        {onToggleColapsado && <button type="button" onClick={onToggleColapsado} title={colapsado ? "Expandir menú" : "Contraer menú"} aria-label={colapsado ? "Expandir menú" : "Contraer menú"} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--admin-texto-suave)] hover:bg-[var(--admin-fondo-hover)] ${colapsado ? "justify-center" : ""}`}>
          {colapsado ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!colapsado && "Contraer menú"}
        </button>}
        {session?.user && <div className={`flex items-center gap-2 px-3 py-2 ${colapsado ? "justify-center" : ""}`} title={session.user.email ?? undefined}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--admin-fondo-hover)] text-xs font-semibold text-[var(--admin-texto)]">{session.user.name?.[0]?.toUpperCase() ?? "U"}</span>
          {!colapsado && <span className="min-w-0 truncate text-xs text-[var(--admin-texto-suave)]">{session.user.email}</span>}
        </div>}
        <button type="button" onClick={cerrarSesion} title="Cerrar sesión" className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--admin-texto-suave)] hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)] ${colapsado ? "justify-center" : ""}`}>
          <LogOut size={18} strokeWidth={1.8} />
          {!colapsado && "Cerrar sesión"}
        </button>
      </div>
    </>
  );
}
