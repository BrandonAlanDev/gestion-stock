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
  Menu,
  X,
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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  /* =========================================
     LINKS DE NAVEGACIÓN
     ========================================= */
  const userLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/productos", label: "Catálogo", icon: Store },
    { href: "/plan-de-ahorro", label: "Plan Ahorro", icon: Package }
  ];

  const adminLinks = [
    { href: "/dashboard", label: "Productos", icon: Package },
    { href: "/categories", label: "Categorías", icon: Tags },
    { href: "/provider", label: "Proveedores", icon: Truck },
    { href: "/sizes", label: "Talles", icon: Ruler },
    { href: "/movements", label: "Historial", icon: History },
  ];

  if (status === "loading") return null;

  return (
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

        <div className="flex items-center gap-2 sm:gap-4 z-50">
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/dashboard"
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

          <button
            className="p-2.5 rounded-xl transition-colors cursor-pointer hover:scale-105 active:scale-95"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ 
              color: currentTextColor,
              backgroundColor: isMenuOpen ? overlayHoverColor : "transparent"
            }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-t ${
          isMenuOpen ? "max-h-[85vh] opacity-100 overflow-y-auto shadow-2xl" : "max-h-0 opacity-0"
        }`}
        style={{
          backgroundColor: secondaryColor,
          borderColor: overlayColor,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
          
          {session?.user && (
            <div className="flex items-center justify-between pb-4 sm:pb-6 border-b" style={{ borderColor: overlayColor }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                >
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold" style={{ color: headerTextColor }}>{session.user.name}</span>
                  <span className="text-xs sm:text-sm opacity-60" style={{ color: headerTextColor }}>{session.user.email}</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-red-500/10 text-red-500/80 hover:text-red-500"
              >
                <LogOut size={14} />
                Salir
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold mb-1 px-2 opacity-50" style={{ color: headerTextColor }}>
              Navegación
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              {userLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-4 rounded-xl transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: isActive ? primaryColor : overlayColor,
                      color: isActive ? primaryTextColor : headerTextColor,
                    }}
                  >
                    <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                    <span className="text-sm font-semibold truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {session?.user?.role === "ADMIN" && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold mb-1 px-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                <ShieldCheck size={12} /> Administración
              </span>
              
              <div className="flex flex-wrap gap-2">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 min-w-[140px] sm:min-w-[160px] flex items-center gap-2.5 px-3.5 py-3 rounded-lg border transition-all hover:bg-white/5"
                      style={{
                        backgroundColor: isActive ? primaryColor : "transparent",
                        borderColor: isActive ? primaryColor : overlayColor,
                        color: isActive ? primaryTextColor : headerTextColor,
                      }}
                    >
                      <Icon size={16} style={{ opacity: isActive ? 1 : 0.6 }} />
                      <span className="text-xs sm:text-sm font-semibold truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Autenticación & Logout en Mobile */}
          <div className="sm:hidden pt-2 mt-2 border-t" style={{ borderColor: overlayColor }}>
            {session?.user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-opacity text-red-500/80 hover:text-red-500 hover:bg-red-500/5"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            ) : (
              // Login
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-full gap-2 py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm transition-transform hover:scale-[1.02] shadow-md"
                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
              >
                <User size={18} />
                Iniciar Sesión
              </Link>
            )}
          </div>
          
          {!session?.user && (
            <div className="hidden sm:block pt-4 border-t" style={{ borderColor: overlayColor }}>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-transform hover:scale-[1.02] shadow-md"
                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
              >
                <User size={18} />
                Iniciar Sesión
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}