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
  ShoppingCart,
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

  const { cartCount, openCart } = useCart();

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
    await signOut({
      redirect: false,
    });

    router.refresh();
    router.push("/");
  };

  const linkStyle = (path: string) => `
    flex items-center gap-2 text-sm font-bold uppercase tracking-tighter transition-all duration-300
    ${
      pathname === path
        ? "text-cyan-800 italic"
        : isHomeTop
        ? "text-neutral-800"
        : "text-neutral-800"
    }
  `;

  /*
    =========================
    LINKS
    =========================
  */

  const userLinks = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/productos",
      label: "Catálogo",
      icon: Store,
    },
  ];

  const adminLinks = [
    {
      href: "/dashboard",
      label: "Productos",
      icon: Package,
    },
    {
      href: "/categories",
      label: "Categorías",
      icon: Tags,
    },
    {
      href: "/provider",
      label: "Proveedores",
      icon: Truck,
    },
    {
      href: "/sizes",
      label: "Talles",
      icon: Ruler,
    },
    {
      href: "/movements",
      label: "Historial",
      icon: History,
    },
  ];

  if (status === "loading") {
    return null;
  }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[100]
        transition-all duration-500 
        ${
          isHomeTop
            ? `border-transparent ${isMenuOpen ? "bg-black/80" : "bg-transparent "}`
            : "bg-black/80 backdrop-blur-md "
        } 
      `}
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
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 12 Q6 6 12 12 Q18 18 22 12" />
              </svg>
            </div>
          )}
          <span className="text-[16px] font-medium text-white tracking-tight">
            {pageConfig?.pageConfig?.storeName || <>GESTION<span className="text-cyan-400">OK</span></>}
          </span>
        </Link>

        {/* Actions */}
        <div className={`flex items-center gap-3 p-3 transition-all duration-300 rounded-2xl text-cyan-400 `}>
          {/* Botón del carrito */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-xl transition-all duration-300 hover:text-cyan-400 hover:bg-white/10 text-white"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {session?.user ? (
            <>
              {/* User Info */}
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-bold">
                  Hola, {session.user.name}
                </span>

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/pageConfig"
                    className="flex items-center gap-2 text-xs text-cyan-500 font-bold hover:text-cyan-400 transition hover:cursor-pointer"
                  >
                    <ShieldCheck size={14} />
                    Panel Admin
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
            </>
          )}

          {/* Mobile Menu */}
          <button
            className={`
              p-2 rounded-xl transition-all duration-300 hover:text-cyan-400 transition hover:cursor-pointer
              ${
                isHomeTop
                  ? "text-white hover:bg-white/10"
                  : "text-white hover:bg-neutral-900"
              }
            `}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`
          overflow-hidden transition-all duration-500 w-full max-w-7xl mx-auto
          ${isMenuOpen ? "opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="w-full">
          <nav className="flex flex-col md:flex-row md:items-center md:justify-between md:px-6 w-full p-6 gap-6">
            <div>
              {/* Logged User Mobile */}
              {session?.user && (
                <div className="flex flex-col gap-1 border-b border-neutral-800 pb-4">
                  <span className="text-white font-bold">
                    {session.user.name}
                  </span>

                  {session.user.role === "ADMIN" && (
                    <span className="text-cyan-500 text-sm font-medium">
                      Administrador
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 gap-4">
              {/* USER LINKS */}
              {userLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Button key={link.href} variant={"blanco"}>
                    <Link
                      onClick={() => setIsMenuOpen(false)}
                      href={link.href}
                      className={linkStyle(link.href)}
                    >
                      <Icon size={20} />
                      {link.label}
                    </Link>
                  </Button>
                );
              })}

              {/* ADMIN LINKS */}
              {session?.user?.role === "ADMIN" &&
                adminLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Button key={link.href} variant={"blanco"}>
                      <Link
                        onClick={() => setIsMenuOpen(false)}
                        href={link.href}
                        className={linkStyle(link.href)}
                      >
                        <Icon size={20} />
                        {link.label}
                      </Link>
                    </Button>
                  );
                })}
            </div>

            {/* Login / Logout */}
            {session?.user ? (
              <Button variant={"rojo"} onClick={handleLogout}>
                <div className="flex items-center gap-2 p-3">
                  <LogOut size={18} />
                  Salir
                </div>
              </Button>
            ) : (
              <Button variant={"blanco"}>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <User size={18} />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}