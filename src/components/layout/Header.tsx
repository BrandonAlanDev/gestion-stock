"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Package,
  Tags,
  Truck,
  Ruler,
  LogOut,
  User,
  History,
  Home,
  Store,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

import { useEffect, useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

// --- UTILIDAD PARA CALCULAR EL CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: session, status } = useSession();
  const pageConfig = usePageConfig();

  // Variables dinámicas de color desde Prisma
  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de colores para asegurar legibilidad
  const headerTextColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = headerTextColor === "#ffffff";

  // Lógica de scroll
  const isHomeTop = pathname === "/" && !scrolled;

  // Textos y overlays dinámicos
  const currentTextColor = isHomeTop && !isMenuOpen ? "#ffffff" : headerTextColor;
  const overlayColor = isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const overlayHoverColor = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  /* =========================================
     LINKS DE NAVEGACIÓN
     ========================================= */
  const userLinks = [
    { href: "/productos", label: "Catálogo", icon: Store },
    { href: "/plan-de-ahorro", label: "Plan Ahorro", icon: Package }
  ];


  if (status === "loading") return null;

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${
          isHomeTop && !isMenuOpen
            ? "border-transparent bg-transparent"
            : "backdrop-blur-xl shadow-sm"
        }`}
        style={{
          backgroundColor: isHomeTop && !isMenuOpen ? "transparent" : secondaryColor,
          borderColor: isHomeTop && !isMenuOpen ? "transparent" : overlayColor,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* LOGO Y NOMBRE */}
          <Link href="/" className="flex items-center gap-3 z-50 transition-opacity hover:opacity-80">
            {pageConfig?.pageConfig?.logo ? (
              <img
                src={pageConfig.pageConfig.logo}
                alt="Logo"
                className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div
                className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-lg flex items-center justify-center border"
                style={{ backgroundColor: overlayColor, borderColor: primaryColor }}
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M2 12 Q6 6 12 12 Q18 18 22 12" />
                </svg>
              </div>
            )}
            <span
              className="text-[16px] sm:text-lg font-bold tracking-tight"
              style={{ color: currentTextColor }}
            >
              {pageConfig?.pageConfig?.storeName || (
                <>GESTION<span style={{ color: primaryColor }}>OK</span></>
              )}
            </span>
          </Link>

          {/* BOTONES DERECHOS - SIEMPRE ARRIBA POR LA CAPA z-[110] */}
          <div className="flex items-center gap-2 sm:gap-4 z-[110]">
            {!session && (<Link
              href="/login"
              className="flex items-center justify-center w-full gap-2 py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm"
              style={{ backgroundColor: primaryColor, color: primaryTextColor }}
            >
              <User size={18} />
              Iniciar Sesión
            </Link>)}
            {isAdmin && (
              <Link
                href="/admin" 
                className="hidden sm:flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{
                  backgroundColor: isMenuOpen || !isHomeTop ? overlayColor : "rgba(255,255,255,0.15)",
                  color: currentTextColor,
                }}
              >
                <LayoutDashboard size={14} style={{ color: primaryColor }} />
                Panel Admin
              </Link>
            )}

            {/* BOTÓN HAMBURGUESA / CRUZ */}
            <button
              className="w-11 h-11 flex flex-col items-center justify-center gap-[6px] rounded-xl transition-colors cursor-pointer hover:scale-105 active:scale-95 group relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ 
                backgroundColor: isMenuOpen ? overlayHoverColor : "transparent"
              }}
            >
              <span 
                className={`w-6 h-[2px] rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? "rotate-45 translate-y-[8px]" : ""
                }`}
                style={{ backgroundColor: currentTextColor }}
              />
              <span 
                className={`w-6 h-[2px] rounded-full transition-all duration-300 ${
                  isMenuOpen ? "opacity-0 scale-x-0" : ""
                }`}
                style={{ backgroundColor: currentTextColor }}
              />
              <span 
                className={`w-6 h-[2px] rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? "-rotate-45 -translate-y-[8px]" : ""
                }`}
                style={{ backgroundColor: currentTextColor }}
              />
            </button>
          </div>
        </div>

        {/* MENU DESPLEGABLE EN PC */}
        <div 
          className="hidden sm:block overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-md"
          style={{
            maxHeight: isMenuOpen ? "200px" : "0px",
            backgroundColor: isDarkBg ? "rgba(0, 0, 0, 0.75)" : "rgba(255, 255, 255, 0.75)"
          }}
        >
          <div className="max-w-4xl mx-auto py-6 px-6 flex flex-col gap-4">
            {session?.user && (
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: overlayColor }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    {session.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold" style={{ color: headerTextColor }}>{session.user.name}</span>
                    <span className="text-[10px] opacity-60" style={{ color: headerTextColor }}>{session.user.email}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:opacity-80">
                  <LogOut size={14} /> Salir
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4">
              {userLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] backdrop-blur-sm"
                    style={{ 
                      backgroundColor: isDarkBg ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", 
                      color: headerTextColor 
                    }}
                  >
                    <Icon size={16} style={{ color: primaryColor }} />
                    <span className="text-xs font-bold uppercase tracking-wider">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* OVERLAY DE FONDO PARA CELULAR */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300 sm:hidden"
        />
      )}

      {/* =========================================
         SIDEBAR LATERAL (CELULAR) - CON SEPARACIÓN A LA CRUZ
         ========================================= */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 max-w-[78vw] h-full z-[100] flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out sm:hidden backdrop-blur-lg ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ 
          backgroundColor: isDarkBg ? "rgba(15, 15, 15, 0.75)" : "rgba(255, 255, 255, 0.75)", 
        }}
      >
        <div 
          className="space-y-6 overflow-y-auto flex-1 pt-16 pr-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            div::-webkit-scrollbar { display: none !important; }
          `}} />

          {/* NOMBRE DE LA TIENDA */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: overlayColor }}>
            <span className="text-sm font-black tracking-widest uppercase italic" style={{ color: headerTextColor }}>
              {pageConfig?.pageConfig?.storeName || "VALEN"}
            </span>
          </div>

          {/* SESIÓN DE USUARIO */}
          {session?.user && (
            <div className="flex items-center gap-3 py-2 px-1">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0"
                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
              >
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate" style={{ color: headerTextColor }}>
                  {session.user.name}
                </span>
                <span className="text-xs opacity-60 truncate" style={{ color: headerTextColor }}>
                  {session.user.email}
                </span>
              </div>
            </div>
          )}

          {/* LINKS DE NAVEGACIÓN */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold mb-1 px-2 opacity-50" style={{ color: headerTextColor }}>
              Navegación
            </span>
            <nav className="flex flex-col gap-1.5">
              {userLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive ? primaryColor : overlayColor,
                      color: isActive ? primaryTextColor : headerTextColor,
                    }}
                  >
                    <Icon size={16} style={{ opacity: isActive ? 1 : 0.7 }} />
                    <span className="text-xs font-bold uppercase tracking-wider">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* PIE DEL SIDEBAR (LOGOUT / LOGIN) */}
        <div className="pt-4 border-t space-y-2" style={{ borderColor: overlayColor }}>
          {session?.user ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <span>Cerrar Sesión</span>
              <LogOut size={16} />
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center w-full gap-2 py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm"
              style={{ backgroundColor: primaryColor, color: primaryTextColor }}
            >
              <User size={18} />
              Iniciar Sesión
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}