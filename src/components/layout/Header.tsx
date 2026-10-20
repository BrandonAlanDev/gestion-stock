"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, ChevronRight, LayoutDashboard, LogIn, LogOut, Menu, Package, ShoppingBag, Store, User, X } from "lucide-react";
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
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const pageConfig = usePageConfig();
  const { isCartOpen, openCart, closeCart } = useCart();

  const rawLogo = pageConfig?.pageConfig?.logo;
  const rawStoreName = pageConfig?.pageConfig?.storeName;
  const logo = typeof rawLogo === "string" && rawLogo.length > 0 ? rawLogo : null;
  const storeName = typeof rawStoreName === "string" && rawStoreName.length > 0
    ? rawStoreName
    : "Gestion OK";
  const cartEnabled = pageConfig?.pageConfig?.cartEnabled === true;
  const isAdmin = session?.user?.role === "ADMIN";
  const colorTexto = "var(--texto-sobre-fondo)";
  const colorBorde = "color-mix(in srgb, var(--texto-sobre-fondo) 12%, transparent)";
  const colorHover = "color-mix(in srgb, var(--texto-sobre-fondo) 8%, transparent)";
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onToggleSidebar();
    };
    const alPresionarFuera = (evento: PointerEvent) => {
      if (!headerRef.current?.contains(evento.target as Node)) onToggleSidebar();
    };
    document.addEventListener("keydown", alPresionarTecla);
    document.addEventListener("pointerdown", alPresionarFuera);
    return () => {
      document.removeEventListener("keydown", alPresionarTecla);
      document.removeEventListener("pointerdown", alPresionarFuera);
    };
  }, [isSidebarOpen, onToggleSidebar]);

  const cerrarMenu = () => {
    if (isSidebarOpen) onToggleSidebar();
  };

  const cerrarSesion = async () => {
    cerrarMenu();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-[100] border-b md:left-[var(--sidebar-ancho)] ${isAdminRoute ? "md:hidden" : ""}`}
      style={{ backgroundColor: "var(--superficie-fondo)", borderColor: colorBorde, color: colorTexto }}
    >
      <div className="relative mx-auto w-full max-w-7xl">
      <div className="flex h-16 w-full items-center gap-3 px-4 md:gap-5 md:px-6">
        <Link
          href="/"
          onClick={cerrarMenu}
          className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primario)]"
        >
          {logo ? (
            <Image src={logo} alt="Logo" width={32} height={32} unoptimized={!imagenAdmiteOptimizacion(logo)} className="size-8 rounded-lg object-cover" />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>
              {storeName[0]?.toUpperCase() ?? "T"}
            </span>
          )}
          <span className="max-w-32 truncate text-sm font-semibold tracking-tight sm:max-w-40 sm:text-base">
            {storeName}
          </span>
        </Link>

        <div className="mx-auto hidden w-full max-w-md min-w-0 md:block">
          <Searchbarfinder isHomeTop={false} onNavigate={cerrarMenu} />
        </div>

        <nav aria-label="Navegación principal" className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
          <Link href="/productos" onClick={cerrarMenu} className="hidden min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)] md:flex" aria-current={pathname === "/productos" ? "page" : undefined}>
            <Store size={17} /> Catálogo
          </Link>

          {cartEnabled && (
            <button
              type="button"
              onClick={() => {
                cerrarMenu();
                if (isCartOpen) closeCart();
                else openCart();
              }}
              aria-label={isCartOpen ? "Cerrar carrito" : "Abrir carrito"}
              className="flex size-10 items-center justify-center rounded-lg hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]"
            >
              <ShoppingBag size={20} />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            aria-controls="menu-tienda"
            aria-expanded={isSidebarOpen}
            className="flex min-h-10 items-center gap-2 rounded-lg px-2.5 hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]"
            style={{ backgroundColor: isSidebarOpen ? colorHover : undefined }}
          >
            {session?.user ? (
              <span className="flex size-7 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            ) : isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
              {session?.user ? session.user.name || "Mi cuenta" : "Cuenta"}
            </span>
            <ChevronDown size={15} className={`hidden transition-transform duration-200 md:block ${isSidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </nav>
      </div>

      {isSidebarOpen && (
        <div
          id="menu-tienda"
          className="absolute left-4 right-4 top-full mt-2 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-xl border p-3 shadow-xl sm:left-auto sm:w-80 md:right-6 md:mt-3 md:w-[348px] md:rounded-[20px] md:p-2 md:shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
          style={{ backgroundColor: "var(--superficie-fondo)", borderColor: colorBorde }}
        >
          <div className="mb-3 md:hidden">
            <Searchbarfinder isHomeTop={false} onNavigate={cerrarMenu} />
          </div>

          {session?.user && (
            <div
              className="mb-2 border-b px-3 pb-3 md:flex md:items-center md:gap-3 md:rounded-2xl md:border md:p-3"
              style={{ borderColor: colorBorde, backgroundColor: colorHover }}
            >
              <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold md:flex" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] opacity-55 md:block">Tu cuenta</p>
                <p className="truncate text-sm font-semibold">{session.user.name || "Mi cuenta"}</p>
                <p className="truncate text-xs opacity-65">{session.user.email}</p>
              </div>
            </div>
          )}

          {!session?.user && status === "unauthenticated" && (
            <div className="hidden rounded-2xl border p-4 md:block" style={{ borderColor: colorBorde, backgroundColor: colorHover }}>
              <p className="text-sm font-semibold">Tu espacio en la tienda</p>
              <p className="mt-1 text-xs leading-relaxed opacity-65">Ingresá para seguir tus pedidos y guardar tus datos.</p>
            </div>
          )}

          <div className="flex flex-col gap-1 text-sm md:gap-0.5 md:pt-1">
            <Link href="/" onClick={cerrarMenu} className="rounded-lg px-3 py-2.5 hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)] md:hidden">Inicio</Link>
            <Link href="/productos" onClick={cerrarMenu} className="rounded-lg px-3 py-2.5 hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)] md:hidden">Catálogo</Link>
            {session?.user && (
              <>
                <Link href="/mis-pedidos" onClick={cerrarMenu} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]">
                  <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg md:flex" style={{ backgroundColor: colorHover }}><Package size={17} /></span>
                  <span className="flex-1 font-medium">Mis pedidos</span>
                  <ChevronRight size={16} className="hidden opacity-40 transition-transform group-hover:translate-x-0.5 md:block" />
                </Link>
                <Link href="/perfil" onClick={cerrarMenu} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]">
                  <span className="flex size-5 shrink-0 items-center justify-center md:size-9 md:rounded-lg md:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]"><User size={17} /></span>
                  <span className="flex-1 font-medium">Mi perfil</span>
                  <ChevronRight size={16} className="hidden opacity-40 transition-transform group-hover:translate-x-0.5 md:block" />
                </Link>
                {isAdmin && (
                  <Link href="/admin/pageConfig" onClick={cerrarMenu} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]">
                    <span className="flex size-5 shrink-0 items-center justify-center md:size-9 md:rounded-lg md:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)]"><LayoutDashboard size={17} /></span>
                    <span className="flex-1 font-medium">Administración</span>
                    <ChevronRight size={16} className="hidden opacity-40 transition-transform group-hover:translate-x-0.5 md:block" />
                  </Link>
                )}
                <div className="my-1 hidden border-t md:block" style={{ borderColor: colorBorde }} />
                <button type="button" onClick={cerrarSesion} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-500 transition-colors hover:bg-red-500/10">
                  <span className="flex size-5 shrink-0 items-center justify-center md:size-9"><LogOut size={17} /></span>
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </>
            )}
            {status === "unauthenticated" && (
              <>
                <Link href="/login" onClick={cerrarMenu} className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium hover:bg-[color-mix(in_srgb,var(--texto-sobre-fondo)_8%,transparent)] md:mt-2 md:justify-center md:rounded-xl md:bg-[var(--color-primario)] md:text-[var(--texto-sobre-primario)] md:hover:bg-[var(--color-primario)] md:hover:opacity-90"><LogIn size={16} /> Ingresar</Link>
                <Link href="/register" onClick={cerrarMenu} className="hidden rounded-lg px-3 py-2.5 text-center text-xs font-medium opacity-70 hover:opacity-100 md:block">Crear una cuenta</Link>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
