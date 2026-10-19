"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  LayoutDashboard, Menu, X, User, Store, LogOut, ShoppingBag,
} from "lucide-react";
import Searchbarfinder from "@/components/home/Searchbarfinder";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";
import { useCart } from "@/contextos/carrito/use-carrito";

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  isAdminRoute,
}: {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAdminRoute?: boolean;
}) {
  const { data: session } = useSession();
  const pageConfig = usePageConfig();
  const { isCartOpen, openCart, closeCart } = useCart();

  const rawLogo = pageConfig?.pageConfig?.logo;
  const rawStoreName = pageConfig?.pageConfig?.storeName;

  const logo = typeof rawLogo === "string" && rawLogo.length > 0 ? rawLogo : null;
  const storeName =
    typeof rawStoreName === "string" && rawStoreName.length > 0 ? rawStoreName : "Gestion OK";
  const cartEnabled = pageConfig?.pageConfig?.cartEnabled === true;

  const currentTextColor = "var(--texto-sobre-fondo)";
  const overlaySuave = "color-mix(in srgb, var(--texto-sobre-fondo) 8%, transparent)";
  const overlayFondoMenu = "var(--superficie-fondo)";

  const sesionActual = session;
  const isAdmin = sesionActual?.user?.role === "ADMIN";
  const mostrarMenuHeader = !(isAdmin && isAdminRoute);
  const mostrarBotonToggle = (isAdmin && isAdminRoute) || mostrarMenuHeader;

  const handleCartClick = () => {
    if (isCartOpen) {
      closeCart();
    } else {
      openCart();
    }
  };

  const cerrarSesion = async () => {
    onToggleSidebar();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] flex flex-col border-b md:left-[var(--sidebar-ancho)] ${isAdminRoute ? "md:hidden" : ""}`}
      style={{
        backgroundColor: "var(--superficie-fondo)",
        borderColor: overlaySuave,
      }}
    >
      <div className="w-full max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
        <Link href="/" onClick={() => { if (isSidebarOpen) onToggleSidebar(); }} className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primario)]">
          {logo ? (
            <Image src={logo} alt="Logo" width={32} height={32} unoptimized={!imagenAdmiteOptimizacion(logo)} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>{storeName[0]?.toUpperCase() ?? "T"}</span>
          )}
          <span className="max-w-32 truncate text-sm font-semibold tracking-tight sm:max-w-48 sm:text-base" style={{ color: currentTextColor }}>
            {storeName}
          </span>
        </Link>
        
        {/* Buscador en Desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <Searchbarfinder isHomeTop={false} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {!sesionActual && (
            <Link
              href="/login"
              className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
            >
              <User size={16} />
              <span className="hidden sm:inline">Ingresar</span>
            </Link>
          )}

          {isAdmin && !isAdminRoute && (
            <Link
              href="/admin/pageConfig"
              className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: overlaySuave, color: currentTextColor }}
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <Link
            href="/productos"
            onClick={() => { if (isSidebarOpen) onToggleSidebar(); }}
            className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: overlaySuave, color: currentTextColor }}
          >
            <Store size={16} />
            <span className="hidden sm:inline">Catálogo</span>
          </Link>

          {cartEnabled && (
            <button
              onClick={handleCartClick}
              aria-label="Abrir carrito"
              className="rounded-lg p-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]"
              style={{ color: currentTextColor }}
            >
              <ShoppingBag size={20} />
            </button>
          )}

          {mostrarBotonToggle && (
            <button
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isSidebarOpen}
              className={`rounded-lg p-2.5 ${isAdmin && isAdminRoute ? "md:hidden" : ""}`}
              style={{
                backgroundColor: isSidebarOpen ? overlaySuave : "transparent",
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
          className={`block transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "overflow-visible" : "overflow-hidden"
          }`}
          style={{
            maxHeight: isSidebarOpen ? "100vh" : "0px", 
            backgroundColor: overlayFondoMenu,
          }}
        >
          <div className="max-w-4xl mx-auto py-6 px-6 flex flex-col gap-4">
            <div className="md:hidden relative w-full z-[110] mx-auto">
              <Searchbarfinder isHomeTop={false} onNavigate={onToggleSidebar} />
            </div>

            {sesionActual?.user && (
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: overlaySuave }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>
                    {sesionActual.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold" style={{ color: "var(--texto-sobre-fondo)" }}>{sesionActual.user.name}</span>
                    <span className="text-[10px] opacity-60" style={{ color: "var(--texto-sobre-fondo)" }}>{sesionActual.user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void signIn("google", { redirectTo: "/" })}
                    className="text-xs font-bold hover:opacity-80"
                    style={{ color: "var(--texto-sobre-fondo)" }}
                  >
                    Vincular Google
                  </button>
                  <button onClick={cerrarSesion} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:opacity-80">
                    <LogOut size={14} /> Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
