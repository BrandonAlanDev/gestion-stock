"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import SidebarMovil from "@/components/layout/SidebarMovil";
import SessionWrapper from "@/components/providers/SessionWrapper";
import { Toaster } from "sonner";
import CartSidebar from "@/components/cart/CartSidebar";
import { CartProvider } from "@/contextos/carrito/proveedor-carrito";
import { useCart } from "@/contextos/carrito/use-carrito";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isCartOpen, closeCart } = useCart();
  const tenantId = useTenantId();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const pathname = usePathname();

  // El sidebar solo se muestra en rutas de administración
  const isAdminRoute = pathname.startsWith("/admin");
  const esRutaMantenimiento = pathname === "/mantenimiento";

  useEffect(() => {
    const guardado = window.localStorage.getItem(
      `sidebar-colapsado:${tenantId ?? "sin-tenant"}`
    );
    if (guardado === "1") setColapsado(true);
    if (guardado === "0" || guardado === null) setColapsado(false);
  }, [tenantId]);

  useEffect(() => {
    window.localStorage.setItem(
      `sidebar-colapsado:${tenantId ?? "sin-tenant"}`,
      colapsado ? "1" : "0"
    );
  }, [colapsado, tenantId]);

  return (
    <div
      className="flex min-h-screen"
      style={{ "--sidebar-ancho": isAdminRoute ? (colapsado ? "72px" : "256px") : "0px" } as CSSProperties}
    >
      {/* Sidebar condicionado a ruta admin */}
      {isAdminRoute && (
        <>
          <Sidebar colapsado={colapsado} onToggleColapsado={() => setColapsado((v) => !v)} />
          <SidebarMovil isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}

      {/* Contenido principal + header */}
      <div className="flex-1 flex flex-col min-w-0">
        {!esRutaMantenimiento && (
          <Header
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isAdminRoute={isAdminRoute}
          />
        )}

        <main className={`flex-grow ${isAdminRoute ? "pt-16 md:pt-0 md:pl-[var(--sidebar-ancho)] transition-[padding] duration-300" : ""}`}>
          {children}
        </main>
      </div>

      {/* Carrito y Toaster existentes */}
      {!esRutaMantenimiento && (
        <CartSidebar
          isOpen={isCartOpen}
          onClose={closeCart}
        />
      )}
      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}

export default function LayoutComponent({ children }: { children: React.ReactNode }) {
  return ( 
    <SessionWrapper>
      <CartProvider>
        <AppLayout>{children}</AppLayout>
      </CartProvider>
    </SessionWrapper>
  );
}
