"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import {
  Package, Tags, Truck, Ruler, LogOut, User, History,
  Store, LayoutDashboard, Settings, Image as ImageIcon,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

interface ContenidoSidebarProps {
  colapsado?: boolean;
  onNavegar?: () => void;
  onToggleColapsado?: () => void;
}

export default function ContenidoSidebar({
  colapsado = false,
  onNavegar,
  onToggleColapsado,
}: ContenidoSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const pageConfig = usePageConfig();
  const config = pageConfig?.pageConfig;

  const rawLogo = pageConfig?.pageConfig?.logo;
  const rawStoreName = pageConfig?.pageConfig?.storeName;

  const logo = typeof rawLogo === "string" && rawLogo.length > 0 ? rawLogo : null;
  const storeName =
    typeof rawStoreName === "string" && rawStoreName.length > 0 ? rawStoreName : "VALEN";

  const overlaySuave = "color-mix(in srgb, var(--color-fondo-sitio) 8%, transparent)";

  const isAdmin = session?.user?.role === "ADMIN";

  const userLinks = [
    { href: "/", label: "Ir a la Tienda", icon: Store },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/dashboard", label: "Productos", icon: Package },
    { href: "/admin/categories", label: "Categorías", icon: Tags },
    { href: "/admin/provider", label: "Proveedores", icon: Truck },
    { href: "/admin/sizes", label: "Talles", icon: Ruler },
    { href: "/admin/movements", label: "Historial", icon: History },
    { href: "/admin/design", label: "Diseño", icon: ImageIcon },
    {
      href: "/admin/personalizado",
      label: "Personalizado",
      icon: Settings,
      enabled: config ? Boolean(config.personalizadoEnabled) : true
    },
    { href: "/admin/pageConfig", label: "Configuración", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  const hoverFondo = "hover:bg-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)]";

  const linkClases = (active: boolean) =>
    `group relative flex items-center py-3 rounded-xl font-bold transition-all active:scale-[0.98] select-none ${colapsado
      ? `gap-0 pl-3 pr-3${active ? "" : ` ${hoverFondo}`}`
      : `gap-3 pl-4 pr-4 text-xs uppercase tracking-wide${active ? "" : ` ${hoverFondo}`}`
    }`;

  const etiquetaClases = (maxW: string) =>
    `overflow-hidden whitespace-nowrap transition-all duration-300 ${colapsado ? "max-w-0 opacity-0" : `${maxW} opacity-100`}`;

  const linkStyle = (active: boolean) => ({
    ...(active ? { backgroundColor: "var(--color-primario)" } : {}),
    color: active ? "var(--texto-sobre-primario)" : "var(--texto-sobre-fondo)",
  });

  const bloquearArrastre = (e: React.DragEvent) => e.preventDefault();

  return (
    <>
      <Link
        href="/"
        draggable={false}
        onDragStart={bloquearArrastre}
        className={`flex items-center gap-3 pb-6 border-b transition-all duration-300 select-none ${colapsado ? "pl-1" : ""}`}
        style={{ borderColor: overlaySuave }}
      >
        {logo ? (
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover shrink-0" draggable={false} />
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0" style={{ borderColor: "var(--color-primario)" }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-primario)" }} />
          </div>
        )}
        <span className={`${etiquetaClases("max-w-32")} text-sm font-black tracking-tight uppercase italic`} style={{ color: "var(--texto-sobre-fondo)" }}>
          {storeName}
        </span>
      </Link>

      {session?.user && (
        <div className={`group relative flex items-center py-2 rounded-xl transition-all select-none ${colapsado ? "gap-0 px-0" : "gap-3 px-1.5"}`}>
          <div className="relative shrink-0 w-10 h-10">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Usuario"}
                className="w-10 h-10 rounded-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>
                {session.user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={onToggleColapsado}
              aria-label="Expandir menú"
              className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-300 ${colapsado ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"}`}
              style={{ backgroundColor: "color-mix(in srgb, var(--color-fondo-sitio) 55%, transparent)", color: "var(--texto-sobre-fondo)" }}
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
          <div className={`min-w-0 flex-1 flex flex-col overflow-hidden transition-all duration-300 ${colapsado ? "max-w-0 opacity-0" : "max-w-full opacity-100"}`}>
            <span className="text-xs font-bold truncate" style={{ color: "var(--texto-sobre-fondo)" }}>{session.user.name}</span>
            <span className="text-[10px] opacity-60 truncate" style={{ color: "var(--texto-sobre-fondo)" }}>{session.user.email}</span>
          </div>
          <button
            onClick={onToggleColapsado}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = overlaySuave; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            aria-label="Contraer menú"
            className={`p-2 rounded-xl overflow-hidden whitespace-nowrap transition-all duration-300 ${colapsado ? "max-w-0 opacity-0" : "max-w-8 opacity-100"}`}
            style={{ color: "var(--texto-sobre-fondo)", backgroundColor: "transparent" }}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      )}

      <div className="space-y-1 mt-4">
        <div className="h-3 flex items-center overflow-hidden">
          <span className={`px-2 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all duration-300 ${colapsado ? "max-w-0 opacity-0" : "max-w-28 opacity-50"}`} style={{ color: "var(--texto-sobre-fondo)" }}>
            Tienda
          </span>
          <div className={`flex-1 h-px mx-3 transition-opacity duration-300 ${colapsado ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: overlaySuave }} />
        </div>
        {userLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavegar}
              draggable={false}
              onDragStart={bloquearArrastre}
              className={linkClases(active)}
              style={linkStyle(active)}
              title={link.label}
            >
              <Icon size={16} className="shrink-0" />
              <span className={etiquetaClases("max-w-40")}>{link.label}</span>
              {colapsado && (
                <span
                  className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50 corto:hidden"
                  style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
                >
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {isAdmin && (
        <div className="space-y-1 mt-6">
          <div className="h-3 flex items-center overflow-hidden">
            <span className={`px-2 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all duration-300 ${colapsado ? "max-w-0 opacity-0" : "max-w-28 opacity-50"}`} style={{ color: "var(--texto-sobre-fondo)" }}>
              Admin
            </span>
            <div className={`flex-1 h-px mx-3 transition-opacity duration-300 ${colapsado ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: overlaySuave }} />
          </div>
          {adminLinks
            .filter((link) => link.enabled !== false)
            .map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavegar}
                  draggable={false}
                  onDragStart={bloquearArrastre}
                  className={linkClases(active)}
                  style={linkStyle(active)}
                  title={link.label}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className={etiquetaClases("max-w-40")}>{link.label}</span>
                  {colapsado && (
                    <span
                      className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50 corto:hidden"
                      style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
                    >
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      )}

      <div className="mt-auto pt-6 border-t" style={{ borderColor: overlaySuave }}>
        {session ? (
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className={`group relative flex items-center w-full rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all select-none ${colapsado ? "gap-0 pl-3 pr-3 py-3" : "gap-3 pl-4 pr-4 py-3"}`}
          >
            <LogOut size={16} className="shrink-0" />
            <span className={etiquetaClases("max-w-32")}>Cerrar Sesión</span>
            {colapsado && (
              <span
                className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50 corto:hidden"
                style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
              >
                Cerrar Sesión
              </span>
            )}
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onNavegar}
            draggable={false}
            onDragStart={bloquearArrastre}
            title="Iniciar Sesión"
            className={`group relative flex items-center w-full rounded-xl font-bold uppercase text-xs transition-all select-none ${colapsado ? "gap-0 pl-3 pr-3 py-3" : "gap-2 pl-4 pr-4 py-3"}`}
            style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
          >
            <User size={16} className="shrink-0" />
            <span className={etiquetaClases("max-w-28")}>Iniciar Sesión</span>
            {colapsado && (
              <span
                className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50 corto:hidden"
                style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
              >
                Iniciar Sesión
              </span>
            )}
          </Link>
        )}
      </div>
    </>
  );
}
