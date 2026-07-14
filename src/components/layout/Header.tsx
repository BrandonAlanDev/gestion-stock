"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Menu, X, User, Store, Package, LogOut, ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useCart } from "@/context/CartContext";
import Searchbarfinder from "@/components/home/Searchbarfinder";

function getContrastColor(hex: string) {
  if (!hex) return "#000000";
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#000000" : "#ffffff";
}

const enlacesUsuario = [
  { href: "/productos", label: "Catálogo", icon: Store },
  { href: "/plan-de-ahorro", label: "Plan Ahorro", icon: Package },
];

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  isAdminRoute,
}: {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAdminRoute?: boolean;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const pageConfig = usePageConfig();
  const { isCartOpen, openCart, closeCart } = useCart();
  const [scrolled, setScrolled] = useState(false);

  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";
  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";

  const isHomeTop = pathname === "/" && !scrolled && !isSidebarOpen && !isAdminRoute;
  const currentTextColor = isHomeTop ? "#ffffff" : textColor;
  const overlayColor = isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const isAdmin = session?.user?.role === "ADMIN";
  const mostrarMenuHeader = !(isAdmin && isAdminRoute);
  const mostrarBotonToggle = (isAdmin && isAdminRoute) || mostrarMenuHeader;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleCartClick = () => {
    isCartOpen ? closeCart() : openCart();
  };

  const cerrarSesion = async () => {
    onToggleSidebar();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] border-b flex flex-col backdrop-blur-md transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: isHomeTop ? "transparent" : secondaryColor,
        borderColor: isHomeTop ? "transparent" : overlayColor,
      }}
    >
      <div className="w-full max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {pageConfig?.pageConfig?.logo ? (
            <img src={pageConfig.pageConfig.logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: primaryColor }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
          )}
          <span className="text-sm font-black uppercase italic" style={{ color: currentTextColor }}>
            {pageConfig?.pageConfig?.storeName || "Gestion OK"}
          </span>
        </Link>
        
        {/* Buscador en Desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <Searchbarfinder isHomeTop={isHomeTop} />
        </div>

        <div className="flex items-center gap-3">
          {!session && (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all hover:opacity-80"
              style={{ backgroundColor: primaryColor, color: primaryTextColor }}
            >
              <User size={16} />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Link>
          )}

          {isAdmin && !isAdminRoute && (
            <Link
              href="/admin/pageConfig"
              className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: overlayColor, color: currentTextColor }}
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {pageConfig?.pageConfig?.cartEnabled && (
            <button
              onClick={handleCartClick}
              className="p-2 rounded-xl transition-all hover:bg-black/5"
              style={{ color: currentTextColor }}
            >
              <ShoppingBag size={20} />
            </button>
          )}

          {mostrarBotonToggle && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl"
              style={{
                backgroundColor: isSidebarOpen ? overlayColor : "transparent",
                color: currentTextColor,
              }}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {mostrarMenuHeader && (
        <div
          className={`block transition-all duration-300 ease-in-out backdrop-blur-md ${
            isSidebarOpen ? "overflow-visible" : "overflow-hidden"
          }`}
          style={{
            maxHeight: isSidebarOpen ? "100vh" : "0px", 
            backgroundColor: isDarkBg ? "rgba(0, 0, 0, 0.75)" : "rgba(255, 255, 255, 0.75)",
          }}
        >
          <div className="max-w-4xl mx-auto py-6 px-6 flex flex-col gap-4">
            <div className="md:hidden relative w-full z-[110] mx-auto">
              <Searchbarfinder isHomeTop={false} />
            </div>
            
            {/* Buscador en Mobile */}

            {session?.user && (
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: overlayColor }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    {session.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold" style={{ color: textColor }}>{session.user.name}</span>
                    <span className="text-[10px] opacity-60" style={{ color: textColor }}>{session.user.email}</span>
                  </div>
                </div>
                <button onClick={cerrarSesion} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:opacity-80">
                  <LogOut size={14} /> Salir
                </button>
              </div>
            )}
            <div className="flex items-center justify-center gap-4">
              {enlacesUsuario.map((link) => {
                const Icono = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onToggleSidebar}
                    className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] backdrop-blur-sm"
                    style={{ backgroundColor: isDarkBg ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", color: textColor }}
                  >
                    <Icono size={16} style={{ color: primaryColor }} />
                    <span className="text-xs font-bold uppercase tracking-wider">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}