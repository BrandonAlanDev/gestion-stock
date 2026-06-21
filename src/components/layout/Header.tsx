"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

function getContrastColor(hex: string) {
  if (!hex) return "#000000";
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#000000" : "#ffffff";
}

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
  const [scrolled, setScrolled] = useState(false);

  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";
  const textColor = getContrastColor(secondaryColor);
  const isDarkBg = textColor === "#ffffff";

  // El header es transparente SOLO en la home sin scroll, sin menú abierto y NO en ruta admin
  const isHomeTop =
    pathname === "/" && !scrolled && !isSidebarOpen && !isAdminRoute;

  const currentTextColor = isHomeTop ? "#ffffff" : textColor;
  const overlayColor = isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] h-16 border-b flex items-center px-4 md:px-6 backdrop-blur-md"
      style={{
        backgroundColor: isHomeTop ? "transparent" : secondaryColor,
        borderColor: isHomeTop ? "transparent" : overlayColor,
      }}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          {pageConfig?.pageConfig?.logo ? (
            <img
              src={pageConfig.pageConfig.logo}
              alt="Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg border flex items-center justify-center"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          )}
          <span
            className="text-sm font-black uppercase italic"
            style={{ color: currentTextColor }}
          >
            {pageConfig?.pageConfig?.storeName || "VALEN"}
          </span>
        </Link>

        {/* Lado derecho */}
        <div className="flex items-center gap-3">
          {/* Botón Admin (solo fuera del panel) */}
          {isAdmin && !isAdminRoute && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: overlayColor, color: currentTextColor }}
            >
              <LayoutDashboard size={14} />
              Admin
            </Link>
          )}

          {/* Hamburguesa (solo en rutas admin) */}
          {isAdminRoute && (
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
    </header>
  );
}