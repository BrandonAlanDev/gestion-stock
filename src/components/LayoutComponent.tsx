"use client";

import Header from "@/components/Header";
import SessionWrapper from "./providers/SessionWrapper";
import { Toaster } from "sonner";
import CartSidebar from "@/components/catalogo/CartSidebar";
import { CartProvider, useCart } from "@/context/CartContext";

// Componente interno para acceder al contexto
function AppLayout({ children, branding }: { children: React.ReactNode; branding: any }) {
  const { cartCount, openCart, isCartOpen, closeCart, cartItems, updateQty, removeItem } = useCart();
  
  return (
    <>
      <Header cartCount={cartCount} onOpenCart={openCart} branding={branding} />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={closeCart}
        cartItems={cartItems}
        updateQty={updateQty}
        removeItem={removeItem}
      />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="border-t-2 border-gray-50">
      </footer>
      <Toaster richColors position="top-right" closeButton />
    </>
  );
}

// Componente principal exportado
export default function LayoutComponent({ children, branding }: { children: React.ReactNode; branding: any }) {
  return (
    <SessionWrapper>
      <CartProvider>
        <AppLayout branding={branding}>
          {children}
        </AppLayout>
      </CartProvider>
    </SessionWrapper>
  );
}