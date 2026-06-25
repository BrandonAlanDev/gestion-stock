"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Menu, X, User, Store, Package, LogOut,
} from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);

  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";
  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";

  const isHomeTop =
    pathname === "/" && !scrolled && !isSidebarOpen && !isAdminRoute;

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

  const cerrarSesion = async () => {
    onToggleSidebar();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <>
      {/* HEADER PRINCIPAL: sin altura fija para permitir el dropdown debajo */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] border-b flex flex-col backdrop-blur-md transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: isHomeTop ? "transparent" : secondaryColor,
          borderColor: isHomeTop ? "transparent" : overlayColor,
        }}
      >
        {/* FILA SUPERIOR (logo, botones, hamburguesa) */}
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
              {pageConfig?.pageConfig?.storeName || "VALEN"}
            </span>
          </Link>

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
                href="/admin"
                className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: overlayColor, color: currentTextColor }}
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
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

        {/* -------------------------------------------------- */}
        {/* DROPDOWN DE ESCRITORIO (idéntico al primer archivo) */}
        {/* -------------------------------------------------- */}
        {mostrarMenuHeader && (
          <div
            className="hidden sm:block overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-md"
            style={{
              maxHeight: isSidebarOpen ? "200px" : "0px",
              backgroundColor: isDarkBg
                ? "rgba(0, 0, 0, 0.75)"
                : "rgba(255, 255, 255, 0.75)",
            }}
          >
            <div className="max-w-4xl mx-auto py-6 px-6 flex flex-col gap-4">
              {session?.user && (
                <div
                  className="flex items-center justify-between pb-3 border-b"
                  style={{ borderColor: overlayColor }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                    >
                      {session.user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold" style={{ color: textColor }}>
                        {session.user.name}
                      </span>
                      <span className="text-[10px] opacity-60" style={{ color: textColor }}>
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={cerrarSesion}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:opacity-80"
                  >
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
                      style={{
                        backgroundColor: isDarkBg
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                        color: textColor,
                      }}
                    >
                      <Icono size={16} style={{ color: primaryColor }} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* -------------------------------------------------- */}
      {/* SIDEBAR MÓVIL + OVERLAY (idéntico al primer archivo) */}
      {/* -------------------------------------------------- */}
      {mostrarMenuHeader && (
        <>
          <aside
            className={`fixed inset-y-0 left-0 w-72 max-w-[78vw] h-full z-[110] flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out sm:hidden backdrop-blur-lg ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            style={{
              backgroundColor: isDarkBg
                ? "rgba(15, 15, 15, 0.75)"
                : "rgba(255, 255, 255, 0.75)",
            }}
          >
            <div
              className="space-y-6 overflow-y-auto flex-1 pt-16 pr-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `div::-webkit-scrollbar { display: none !important; }`,
                }}
              />

              {/* Nombre de la tienda */}
              <div
                className="flex items-center justify-between pb-4 border-b"
                style={{ borderColor: overlayColor }}
              >
                <span
                  className="text-sm font-black tracking-widest uppercase italic"
                  style={{ color: textColor }}
                >
                  {pageConfig?.pageConfig?.storeName || "VALEN"}
                </span>
              </div>

              {/* Sesión del usuario */}
              {session?.user && (
                <div className="flex items-center gap-3 py-2 px-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0"
                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                  >
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate" style={{ color: textColor }}>
                      {session.user.name}
                    </span>
                    <span
                      className="text-xs opacity-60 truncate"
                      style={{ color: textColor }}
                    >
                      {session.user.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Links de navegación */}
              <div className="flex flex-col gap-2">
                <span
                  className="text-[10px] uppercase tracking-widest font-bold mb-1 px-2 opacity-50"
                  style={{ color: textColor }}
                >
                  Navegación
                </span>
                <nav className="flex flex-col gap-1.5">
                  {enlacesUsuario.map((link) => {
                    const activo = pathname === link.href;
                    const Icono = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onToggleSidebar}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                        style={{
                          backgroundColor: activo ? primaryColor : overlayColor,
                          color: activo ? primaryTextColor : textColor,
                        }}
                      >
                        <Icono size={16} style={{ opacity: activo ? 1 : 0.7 }} />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Pie del sidebar */}
            <div className="pt-4 border-t space-y-2" style={{ borderColor: overlayColor }}>
              {session?.user ? (
                <button
                  onClick={cerrarSesion}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <span>Cerrar Sesión</span>
                  <LogOut size={16} />
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onToggleSidebar}
                  className="flex items-center justify-center w-full gap-2 py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                >
                  <User size={18} />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </aside>

          {/* Overlay para cerrar el menú en móvil */}
          {isSidebarOpen && (
            <div
              onClick={onToggleSidebar}
              className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm transition-opacity duration-300 sm:hidden"
            />
          )}
        </>
      )}
    </>
  );
}