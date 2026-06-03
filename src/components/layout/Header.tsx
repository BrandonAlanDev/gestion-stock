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
  LogIn,
  Menu,
  X,
  User,
  History,
  ShieldCheck,
  ShoppingCart,
  UserCheck,
  Search,
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
  const [searchQuery, setSearchQuery] = useState("");

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
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const linkStyle = (path: string) => `
    text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap
    ${
      pathname === path
        ? "text-cyan-400 font-black scale-105"
        : "text-white/80 hover:text-white"
    }
  `;

  // --- NAVEGACIÓN ENFOCADA EN EL CORE BUSINESS (80% BOTINES + URBANO) ---
  const headerLinks = [
    { href: "/productos?categoria=deporte", label: " Deporte" }, // Acceso ultra rápido al motor de ventas
    { href: "/productos?categoria=calzado", label: "Urbano" },     // Para la cultura sneaker diaria
    { href: "/productos", label: "Catálogo" },                     // Exploración general
    { href: "/contacto", label: "Contacto" },
  ];

  const adminLinks = [
    { href: "/dashboard", label: "Productos", icon: Package },
    { href: "/categories", label: "Categorías", icon: Tags },
    { href: "/provider", label: "Proveedores", icon: Truck },
    { href: "/sizes", label: "Talles", icon: Ruler },
    { href: "/movements", label: "Historial", icon: History },
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
            ? `border-b border-white/5 ${isMenuOpen ? "bg-black" : "bg-transparent backdrop-blur-xs"}`
            : "bg-black/95 border-b border-white/10 backdrop-blur-md"
        } 
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        
        {/* IZQUIERDA: Identidad Visual */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 z-10">
          {pageConfig?.pageConfig?.logo ? (
            <img
              src={pageConfig.pageConfig?.logo}
              alt="Logo"
              className="w-[34px] h-[34px] rounded-lg object-cover"
            />
          ) : (
            <div className="w-[34px] h-[34px] rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 12 Q6 6 12 12 Q18 18 22 12" />
              </svg>
            </div>
          )}
          <span className="text-[16px] font-black tracking-tighter text-white uppercase italic">
            {pageConfig?.pageConfig?.storeName || <>MYA<span className="text-cyan-400"></span></>}
          </span>
        </Link>

        {/* CENTRO: Enlaces de Nicho de Alta Conversión */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10 mx-auto">
          {headerLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkStyle(link.href)}>
              {link.label}
            </Link>
          ))}
          
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin/pageConfig"
              className="text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck size={14} /> Panel
            </Link>
          )}
        </nav>

        {/* DERECHA: Búsqueda Semántica de Modelos + Carrito */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 z-10">
          
          {/* Input optimizado con placeholder para calzado específico */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden sm:flex items-center relative bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-cyan-400 transition-all duration-300 max-w-[160px] lg:max-w-[220px]"
          >
            <input 
              type="text" 
              placeholder="BUSCAR MODELO O TERRENO..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-[10px] font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none w-full pr-6"
            />
            <button type="submit" className="absolute right-2.5 text-white/50 hover:text-cyan-400 transition-colors">
              <Search size={14} className="stroke-[2.5]" />
            </button>
          </form>

          {/* Icono Carrito */}
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl transition-all duration-300 text-white hover:text-cyan-400 hover:bg-white/10"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-cyan-400 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Autenticación */}
          <div className="hidden md:flex items-center">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end text-right">
                  <span className="text-xs text-white font-bold max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-[10px] text-red-400 font-bold uppercase tracking-wider hover:text-red-300 transition-colors"
                  >
                    Salir
                  </button>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400 border border-white/5">
                  <UserCheck size={18} />
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white hover:text-cyan-400 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-300"
              >
                <LogIn size={15} />
                <span>Ingresar</span>
              </Link>
            )}
          </div>

          {/* Hamburguesa Mobile */}
          <button
            className="p-2.5 rounded-xl transition-all duration-300 text-white hover:text-cyan-400 hover:bg-white/10 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Alternar menú"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ RESPONSIVO MOBILE */}
      <div
        className={`
          overflow-hidden transition-all duration-500 bg-black/95 border-b border-white/5 backdrop-blur-lg lg:hidden
          ${isMenuOpen ? "max-h-[100vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
          
          {/* Form de búsqueda mobile técnico */}
          <form onSubmit={handleSearchSubmit} className="flex sm:hidden items-center relative bg-white/5 border border-white/10 rounded-xl px-4 h-12 focus-within:border-cyan-400 w-full">
            <input 
              type="text" 
              placeholder="¿QUÉ BOTÍN BUSCÁS?..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-xs font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none w-full pr-8"
            />
            <button type="submit" className="absolute right-4 text-white/50 hover:text-cyan-400">
              <Search size={18} />
            </button>
          </form>

          {session?.user && (
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">{session.user.name}</span>
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  {session.user.role === "ADMIN" ? "Administrador" : "Cliente"}
                </span>
              </div>
            </div>
          )}

          {/* Enlaces Mobile */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Secciones Destacadas</p>
            <div className="grid grid-cols-1 gap-3">
              {headerLinks.map((link) => (
                <Button key={link.href} variant={"blanco"} asChild className="w-full justify-start h-12 bg-white/5 border-white/5 hover:bg-white/10 text-white">
                  <Link onClick={() => setIsMenuOpen(false)} href={link.href}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Admin Panel en Mobile */}
          {session?.user?.role === "ADMIN" && (
            <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400/50">Administración</p>
              <div className="grid grid-cols-2 gap-2">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button key={link.href} variant={"blanco"} asChild className="justify-start gap-2 h-10 bg-white/5 text-xs text-white/80 border-transparent">
                      <Link onClick={() => setIsMenuOpen(false)} href={link.href}>
                        <Icon size={16} className="text-cyan-400" />
                        {link.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botón Auth */}
          <div className="border-t border-white/10 pt-6 pb-2">
            {session?.user ? (
              <Button variant={"rojo"} onClick={handleLogout} className="w-full h-12 justify-center gap-2 text-sm font-bold uppercase tracking-wider">
                <LogOut size={18} />
                Cerrar Sesión
              </Button>
            ) : (
              <Button variant={"blanco"} asChild className="w-full h-12 justify-center gap-2 text-sm font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 border-none text-black">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <User size={18} />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}