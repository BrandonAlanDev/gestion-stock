"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import {
  Package, Tags, Truck, Ruler, LogOut, User, History,
  Store, LayoutDashboard, Settings, Home
} from "lucide-react";

function getContrastColor(hex: string) {
  if (!hex) return "#000000";
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#000000" : "#ffffff";
}

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const pageConfig = usePageConfig();
  const config = pageConfig?.pageConfig;

  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";
  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";
  const overlayColor = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const isAdmin = session?.user?.role === "ADMIN";

  const userLinks = [
    { href: "/productos", label: "Catálogo", icon: Store },
    { href: "/plan-de-ahorro", label: "Plan Ahorro", icon: Package },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/dashboard", label: "Productos", icon: Package },
    { href: "/admin/categories", label: "Categorías", icon: Tags },
    { href: "/admin/provider", label: "Proveedores", icon: Truck },
    { href: "/admin/sizes", label: "Talles", icon: Ruler },
    { href: "/admin/movements", label: "Historial", icon: History },

    // Enlaces filtrados por la base de datos
    {
      href: "/admin/personalizado",
      label: "Personalizado",
      icon: Settings,
      enabled: config ? Boolean(config.personalizadoEnabled) : true
    },
    { href: "/admin/custom-page", label: "Rutas personalizadas", icon: Settings },
    { href: "/admin/pageConfig", label: "Configuración", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  const linkClasses = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all active:scale-[0.98] ${active ? "" : "hover:bg-opacity-10"
    }`;

  const linkStyle = (active: boolean) => ({
    backgroundColor: active ? primaryColor : "transparent",
    color: active ? primaryTextColor : textColor,
  });

  const sidebarContent = (
    <>
      <Link href="/" className="flex items-center gap-3 pb-6 border-b" style={{ borderColor: overlayColor }}>
        {pageConfig?.pageConfig?.logo ? (
          <img src={pageConfig.pageConfig.logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ borderColor: primaryColor }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          </div>
        )}
        <span className="text-sm font-black tracking-tight uppercase italic" style={{ color: textColor }}>
          {pageConfig?.pageConfig?.storeName || "VALEN"}
        </span>
      </Link>

      {session?.user && (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
            {session.user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate" style={{ color: textColor }}>{session.user.name}</span>
            <span className="text-[10px] opacity-60 truncate" style={{ color: textColor }}>{session.user.email}</span>
          </div>
        </div>
      )}

      <div className="space-y-1 mt-4">
        <span className="text-[10px] uppercase tracking-widest font-bold px-2 opacity-50" style={{ color: textColor }}>
          Tienda
        </span>
        {userLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={linkClasses(active)}
              style={linkStyle(active)}
            >
              <Icon size={16} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {isAdmin && (
        <div className="space-y-1 mt-6">
          <span className="text-[10px] uppercase tracking-widest font-bold px-2 opacity-50" style={{ color: textColor }}>
            Admin
          </span>
          {adminLinks
            .filter((link) => link.enabled !== false)
            .map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={linkClasses(active)}
                  style={linkStyle(active)}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
        </div>
      )}

      <div className="mt-auto pt-6 border-t" style={{ borderColor: overlayColor }}>
        {session ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 w-full hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase text-xs"
            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
          >
            <User size={16} />
            Iniciar Sesión
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Off‑canvas para TODAS las pantallas (móvil y escritorio) */}
      <aside
        className={`fixed inset-y-0 left-0 w-60 max-w-[80vw] z-[110] flex flex-col p-6 transition-transform duration-300 ease-in-out backdrop-blur-xl overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{
          backgroundColor: isDarkBg ? "rgba(15,15,15,0.85)" : "rgba(255,255,255,0.85)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Overlay para cerrar el menú (todas las pantallas) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
        />
      )}
    </>
  );
}