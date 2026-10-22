"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import AdminHeader from "@/components/layout/AdminHeader";
import Sidebar from "@/components/layout/Sidebar";
import SidebarMovil from "@/components/layout/SidebarMovil";
import { Toaster } from "sonner";
import CartSidebar from "@/components/cart/CartSidebar";
import { CartProvider } from "@/contextos/carrito/proveedor-carrito";
import { useCart } from "@/contextos/carrito/use-carrito";
import { ContextoTemaAdmin } from "@/contextos/admin/contexto-tema-admin";

function AppLayout({ children }: { children: React.ReactNode }) {
  const temaAdmin = useContext(ContextoTemaAdmin);
  const { isCartOpen, closeCart } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const cerrarSidebar = useCallback(() => setSidebarOpen(false), []);
  const pathname = usePathname();

  // El sidebar solo se muestra en rutas de administración
  const isAdminRoute = pathname.startsWith("/admin");
  const esRutaMantenimiento = pathname === "/mantenimiento";
  const esRutaCheckout = pathname === "/checkout";

  useEffect(() => {
    const guardado = window.localStorage.getItem(
      `sidebar-colapsado:gestion-stock`
    );
    if (guardado === "1") setColapsado(true);
    if (guardado === "0" || guardado === null) setColapsado(false);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      `sidebar-colapsado:gestion-stock`,
      colapsado ? "1" : "0"
    );
  }, [colapsado]);

  return (
    <div
      className="flex min-h-screen"
      style={{ "--sidebar-ancho": isAdminRoute ? (colapsado ? "72px" : "256px") : "0px" } as CSSProperties}
    >
      {/* Sidebar condicionado a ruta admin */}
      {isAdminRoute && (
        <>
          <Sidebar colapsado={colapsado} onToggleColapsado={() => setColapsado((v) => !v)} />
          <SidebarMovil isOpen={sidebarOpen} onClose={cerrarSidebar} />
        </>
      )}

      {/* Contenido principal + header */}
      <div className="flex-1 flex flex-col min-w-0">
        {isAdminRoute ? (
          <AdminHeader onOpenMenu={() => setSidebarOpen(true)} menuAbierto={sidebarOpen} />
        ) : !esRutaMantenimiento && (
          <Header
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isAdminRoute={isAdminRoute}
          />
        )}

        <main className={`flex-grow min-w-0 ${isAdminRoute ? "pt-14 lg:pl-[var(--sidebar-ancho)] transition-[padding] duration-300" : esRutaCheckout ? "pt-16" : ""}`}>
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
      <Toaster
        theme={temaAdmin?.tema === "claro" ? "light" : "dark"}
        richColors
        position="top-right"
        closeButton
      />
    </div>
  );
}

export default function LayoutComponent({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AppLayout>{children}</AppLayout>
    </CartProvider>
  );
}
