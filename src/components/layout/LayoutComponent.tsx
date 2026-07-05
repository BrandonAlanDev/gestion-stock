"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import SessionWrapper from "@/components/providers/SessionWrapper";
import { Toaster } from "sonner";
import CartSidebar from "@/components/cart/CartSidebar";
import { CartProvider, useCart } from "@/context/CartContext";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { cartCount, openCart, isCartOpen, closeCart, cartItems, updateQty, removeItem } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // El sidebar solo se muestra en rutas de administración
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar condicionado a ruta admin */}
      {isAdminRoute && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Contenido principal + header */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isAdminRoute={isAdminRoute}
        />

        <main className="flex-grow">
          {children}
        </main>

        <footer className="border-t-2 border-gray-50">
          {/* ... */}
        </footer>
      </div>

      {/* Carrito y Toaster existentes */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={closeCart}
      />
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