"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useState } from "react";
import {
  Package,
  Tags,
  Truck,
  Ruler,
  History,
  LogOut,
  Home,
  LayoutDashboard,
  Settings,
  AlertTriangle,
  ArrowUpDown,
  TrendingUp,
  Menu,
  X
} from "lucide-react";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const pageConfig = usePageConfig();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";

  const overlayColor = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  // Estilo dinámico transparente basado en si el fondo general es claro u oscuro
  const mobileSidebarBg = isDarkBg 
    ? "rgba(0, 0, 0, 0.25)" 
    : "rgba(255, 255, 255, 0.4)";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard", label: "Productos", icon: Package },
    { href: "/categories", label: "Categorías", icon: Tags },
    { href: "/provider", label: "Proveedores", icon: Truck },
    { href: "/sizes", label: "Talles", icon: Ruler },
    { href: "/movements", label: "Historial", icon: History },
    { href: "/admin/pageConfig", label: "Configuración", icon: Settings },
  ];

  const dummyMovements = [
    { id: 1, producto: "Remera Valen Oversize", tipo: "Ingreso", cant: 24, fecha: "Hoy, 14:20" },
    { id: 2, producto: "Buzo Black Essential", tipo: "Egreso", cant: 2, fecha: "Hoy, 11:05" },
    { id: 3, producto: "Gorra Trucker Cyan", tipo: "Ingreso", cant: 10, fecha: "Ayer, 18:40" },
  ];

  return (
    <div className="flex min-h-screen w-full select-none" style={{ backgroundColor: secondaryColor }}>
      
      {/* NAVBAR SUPERIOR - MOBILE */}
      <header 
        className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 border-b z-50 backdrop-blur-md"
        style={{ 
          backgroundColor: isDarkBg ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)", 
          borderColor: overlayColor 
        }}
      >
        <span className="text-sm font-black tracking-tight uppercase italic" style={{ color: textColor }}>
          {pageConfig?.pageConfig?.storeName || "ADMIN"}
        </span>
        
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: overlayColor, color: textColor }}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* SIDEBAR TRANSPARENTE CON EFECTO GLASSMORPHISM */}
      <aside 
        className={`w-64 fixed inset-y-0 left-0 flex flex-col justify-between p-6 z-40 transition-all duration-300 ease-in-out md:translate-x-0 border-r
          ${isSidebarOpen ? "translate-x-0 shadow-2xl backdrop-blur-xl" : "-translate-x-full shadow-none"}
          pt-20 md:pt-6`}
        style={{ 
          backgroundColor: typeof window !== "undefined" && window.innerWidth < 768 ? mobileSidebarBg : secondaryColor, 
          borderColor: overlayColor 
        }}
      >
        <div className="space-y-8">
          {/* Logo del Comercio en Desktop */}
          <Link href="/" className="hidden md:flex items-center gap-3 transition-opacity hover:opacity-80">
            {pageConfig?.pageConfig?.logo ? (
              <img src={pageConfig.pageConfig.logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ backgroundColor: overlayColor, borderColor: primaryColor }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              </div>
            )}
            <span className="text-base font-black tracking-tight uppercase italic" style={{ color: textColor }}>
              {pageConfig?.pageConfig?.storeName || "ADMIN"}
            </span>
          </Link>

          {/* Menú de navegación */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest font-bold mb-2 px-2 opacity-40" style={{ color: textColor }}>
              Menú Admin
            </span>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-wide active:scale-[0.98]"
                  style={{
                    backgroundColor: isActive ? primaryColor : "transparent",
                    color: isActive ? primaryTextColor : textColor,
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? primaryTextColor : primaryColor }} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="pt-4 border-t space-y-4" style={{ borderColor: overlayColor }}>
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate" style={{ color: textColor }}>
                {session?.user?.name || "Admin"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold"
              style={{ color: textColor }}
            >
              <Home size={14} />
              Volver a la Tienda
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* DETRÁS DEL NAVBAR: OVERLAY CON UN DESENFOQUE EXTRA AL ESTAR ABIERTO */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}
    </div>
  );
}