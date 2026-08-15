"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";
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

  const rawPrimary = pageConfig?.pageConfig?.primaryColor;
  const rawSecondary = pageConfig?.pageConfig?.secondaryColor;
  const rawLogo = pageConfig?.pageConfig?.logo;
  const rawStoreName = pageConfig?.pageConfig?.storeName;

  const primaryColor =
    typeof rawPrimary === "string" && rawPrimary.length > 0 ? rawPrimary : "#000000";
  const secondaryColor =
    typeof rawSecondary === "string" && rawSecondary.length > 0 ? rawSecondary : "#FFFFFF";
  const logo = typeof rawLogo === "string" && rawLogo.length > 0 ? rawLogo : null;
  const storeName =
    typeof rawStoreName === "string" && rawStoreName.length > 0 ? rawStoreName : "VALEN";

  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";
  const overlayColor = isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

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

  const linkClasesExpandido = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all active:scale-[0.98] ${active ? "" : "hover:bg-opacity-10"
    }`;

  const linkClasesColapsado =
    "group relative flex items-center justify-center w-full py-3 rounded-xl font-bold transition-all active:scale-[0.98]";

  const linkStyle = (active: boolean) => ({
    backgroundColor: active ? primaryColor : "transparent",
    color: active ? primaryTextColor : textColor,
  });

  return (
    <>
      <Link
        href="/"
        className={`flex items-center gap-3 pb-6 border-b ${colapsado ? "justify-center" : ""}`}
        style={{ borderColor: overlayColor }}
      >
        {logo ? (
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ borderColor: primaryColor }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          </div>
        )}
        {!colapsado && (
          <span className="text-sm font-black tracking-tight uppercase italic" style={{ color: textColor }}>
            {storeName}
          </span>
        )}
      </Link>

      {session?.user && !colapsado && (
        <div className="flex items-center gap-3 py-2">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Usuario"}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
              {session.user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold truncate" style={{ color: textColor }}>{session.user.name}</span>
            <span className="text-[10px] opacity-60 truncate" style={{ color: textColor }}>{session.user.email}</span>
          </div>
          <button
            onClick={onToggleColapsado}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = overlayColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            className="p-2 rounded-xl transition-colors"
            style={{ color: textColor, backgroundColor: "transparent" }}
            aria-label="Contraer menú"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      )}

      {session?.user && colapsado && (
        <div className="relative group flex justify-center py-2">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Usuario"}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
              {session.user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <button
            onClick={onToggleColapsado}
            className="absolute inset-0 m-auto w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", color: "#ffffff" }}
            aria-label="Expandir menú"
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>
      )}

      <div className="space-y-1 mt-4">
        {colapsado ? (
          <div className="mx-3 h-px" style={{ backgroundColor: overlayColor }} />
        ) : (
          <span className="text-[10px] uppercase tracking-widest font-bold px-2 opacity-50" style={{ color: textColor }}>
            Tienda
          </span>
        )}
        {userLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavegar}
              className={colapsado ? linkClasesColapsado : linkClasesExpandido(active)}
              style={linkStyle(active)}
            >
              <Icon size={16} />
              {!colapsado && <span>{link.label}</span>}
              {colapsado && (
                <span
                  className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
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
          {colapsado ? (
            <div className="mx-3 h-px" style={{ backgroundColor: overlayColor }} />
          ) : (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 opacity-50" style={{ color: textColor }}>
              Admin
            </span>
          )}
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
                  className={colapsado ? linkClasesColapsado : linkClasesExpandido(active)}
                  style={linkStyle(active)}
                >
                  <Icon size={16} />
                  {!colapsado && <span>{link.label}</span>}
                  {colapsado && (
                    <span
                      className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50"
                      style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                    >
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      )}

      <div className="mt-auto pt-6 border-t" style={{ borderColor: overlayColor }}>
        {session ? (
          <button
            onClick={handleLogout}
            className={colapsado
              ? "group relative flex items-center justify-center w-full py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
              : "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 w-full hover:bg-red-500/10"}
          >
            <LogOut size={16} />
            {!colapsado && "Cerrar Sesión"}
            {colapsado && (
              <span
                className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
              >
                Cerrar Sesión
              </span>
            )}
          </button>
        ) : (
          <Link
            href="/login"
            onClick={onNavegar}
            className={colapsado
              ? "group relative flex items-center justify-center py-3 rounded-xl"
              : "flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase text-xs"}
            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
          >
            <User size={16} />
            {!colapsado && "Iniciar Sesión"}
            {colapsado && (
              <span
                className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
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
