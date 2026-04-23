"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleSignOut } from "@/actions/auth-actions";
import {
  Shirt,
  Package,
  Tags, // Usado para Categorías
  Truck,
  Ruler,
  LogOut,
  Menu,
  X,
  User,
  History // Icono más descriptivo para Historial
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Header({ session }: { session: any }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estilo para los links activos
  const linkStyle = (path: string) => `
    flex items-center gap-2 text-sm font-bold uppercase tracking-tighter transition-all duration-300
    ${pathname === path ? "text-amber-500 italic" : "text-neutral-400 hover:text-white"}
  `;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-md border-b border-neutral-900 w-dvw max-w-dvw">
      <div className="max-w-dvw mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo / Título */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-amber-500 p-1.5 rounded-lg">
            <Shirt size={20} className="text-black" />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter text-white">
            GESTION<span className="text-amber-500 text-xs not-italic ml-1">OK</span>
          </span>
        </Link>

        {/* Navegación Desktop */}
        {session?.user?.role === "ADMIN" ? (
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className={linkStyle("/dashboard")}>
              <Package size={16} /> Productos
            </Link> 

            {/* NUEVO LINK: CATEGORÍAS */}
            <Link href="/categories" className={linkStyle("/categories")}>
              <Tags size={16} /> Categorías
            </Link>

            <Link href="/provider" className={linkStyle("/provider")}>
              <Truck size={16} /> Proveedores
            </Link>

            <Link href="/sizes" className={linkStyle("/sizes")}>
              <Ruler size={16} /> Talles
            </Link>

            <Link href="/movements" className={linkStyle("/movements")}>
              <History size={16} /> Historial
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex p-6 text-center text-sm text-neutral-400 italic">
            No tienes acceso de administración.
          </div>
        )}

        {/* Acciones / Sesión */}
        {session?.user?.name ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-amber-500 uppercase leading-none">Usuario</span>
              <span className="text-xs text-white font-medium">{session?.user?.name || "Admin"}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSignOut()}
              className="border-neutral-800 bg-neutral-900 hover:bg-red-500/10 hover:border-red-500/50 text-neutral-400 hover:text-red-500 rounded-xl transition-all"
            >
              <LogOut size={18} />
            </Button>

            {/* Botón Mobile Menu */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        ) : (
          <Link href="/login" className="text-sm font-medium flex items-center gap-4 p-2 bg-slate-950/50 border border-neutral-800 rounded-lg hover:bg-amber-500 text-gray-400 hover:text-black transition-colors duration-300">
            <User size={16} /> Iniciar Sesión
          </Link>
        )}
      </div>

      {/* Navegación Mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-b border-neutral-900 animate-in fade-in slide-in-from-top-4">
          {session?.user?.role === "ADMIN" ? (
            <nav className="flex flex-col p-6 gap-6">
              <Link onClick={() => setIsMenuOpen(false)} href="/dashboard" className={linkStyle("/dashboard")}>
                <Package size={20} /> Productos
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/categories" className={linkStyle("/categories")}>
                <Tags size={20} /> Categorías
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/provider" className={linkStyle("/provider")}>
                <Truck size={20} /> Proveedores
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/sizes" className={linkStyle("/sizes")}>
                <Ruler size={20} /> Talles
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/movements" className={linkStyle("/movements")}>
                <History size={20} /> Historial
              </Link>
            </nav>
          ) : (
            <div className="p-6 text-center text-sm text-neutral-400">
              No tienes acceso de administración.
            </div>
          )}
        </div>
      )}
    </header>
  );
}