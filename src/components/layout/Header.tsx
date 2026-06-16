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
} from "lucide-react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomeTop = pathname === "/" && !scrolled;

  const { openCart } = useCart();
  const { data: session, status } = useSession();
  const pageConfig = usePageConfig();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  const linkStyle = (path: string) => `
    flex items-center gap-2 text-xs font-bold uppercase tracking-tighter transition-all duration-300 w-full justify-center
    ${pathname === path ? "text-cyan-800 italic" : "text-neutral-800"}
  `;

  /* =========================================
    LINKS DE NAVEGACIÓN
    =========================================
  */
  const userLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/productos", label: "Catálogo", icon: Store },
    { href: "/plan-de-ahorro", label: "Plan de Ahorro", icon: Package }
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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isHomeTop
          ? `border-transparent ${isMenuOpen ? "bg-black/90" : "bg-transparent"}`
          : "bg-black/90 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {pageConfig?.pageConfig?.logo ? (
            <img
              src={pageConfig.pageConfig?.logo}
              alt="Logo"
              className="w-[34px] h-[34px] rounded-lg"
            />
          ) : (
            <div className="w-[34px] h-[34px] rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 12 Q6 6 12 12 Q18 18 22 12" />
              </svg>
            </div>
          )}
          <span className="text-[16px] font-medium text-white tracking-tight">
            {pageConfig?.pageConfig?.storeName || <>GESTION<span className="text-cyan-400">OK</span></>}
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="flex items-center gap-3 p-3 text-cyan-400">
          {session?.user && (
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-white">Hola, {session.user.name}</span>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin/pageConfig"
                  className="flex items-center gap-2 text-xs text-cyan-500 font-bold hover:text-cyan-400 transition"
                >
                  <ShieldCheck size={14} />
                  Panel Admin
                </Link>
              )}
            </div>
          )}

          <button
            className="p-2 rounded-xl text-white hover:bg-white/10 transition cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`overflow-hidden transition-all duration-500 w-full max-w-7xl mx-auto ${isMenuOpen ? "opacity-100 max-h-[100vh]" : "max-h-0 opacity-0"}`}>
        <div className="w-full px-6 pb-8 pt-2 flex flex-col gap-5">
          
          {/* Info del usuario logueado */}
          {session?.user && (
            <div className="flex flex-col border-b border-neutral-800/60 pb-3">
              <span className="text-neutral-400 text-xs uppercase tracking-wider font-semibold">Usuario</span>
              <span className="text-white text-lg font-bold">{session.user.name}</span>
            </div>
          )}

          <nav className="flex flex-col w-full gap-4">
            
            {/* FILA 1: Links de usuario */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {userLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button key={link.href} variant={"blanco"} className="w-full py-5 px-1">
                    <Link
                      onClick={() => setIsMenuOpen(false)}
                      href={link.href}
                      className={linkStyle(link.href)}
                    >
                      <Icon size={16} />
                      <span className="text-[10px] sm:text-xs truncate">{link.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>

            {/* Separador visual si el usuario es administrador */}
            {session?.user?.role === "ADMIN" && (
              <div className="flex items-center gap-2 text-neutral-500 text-[11px] uppercase tracking-wider font-bold my-1">
                <span className="h-[1px] bg-neutral-800 flex-1"></span>
                <span>Administración</span>
                <span className="h-[1px] bg-neutral-800 flex-1"></span>
              </div>
            )}

            {/* FILA 2: Funciones de Admin */}
            {session?.user?.role === "ADMIN" && (
              <div className="flex flex-wrap gap-2 w-full justify-start">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button 
                      key={link.href} 
                      variant={"blanco"} 
                      className="flex-1 min-w-[100px] sm:min-w-[120px] py-5"
                    >
                      <Link
                        onClick={() => setIsMenuOpen(false)}
                        href={link.href}
                        className={linkStyle(link.href)}
                      >
                        <Icon size={16} />
                        <span>{link.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Sección de cierre/inicio de sesión minimalista */}
            <div className="pt-4 border-t border-neutral-800/40 mt-2 flex justify-center">
              {session?.user ? (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-red-400 transition-colors py-2 px-4 cursor-pointer"
                >
                  <LogOut size={14} />
                  Salir de la cuenta
                </button>
              ) : (
                <Button variant={"blanco"} className="w-full justify-center py-5">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-neutral-800">
                    <User size={16} />
                    Iniciar Sesión
                  </Link>
                </Button>
              )}
            </div>

          </nav>
        </div>
      </div>
    </header>
  );
}