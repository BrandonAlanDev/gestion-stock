"use client";
import Header from "@/components/layout/Header";
import SessionWrapper from "@/components/providers/SessionWrapper";
import { Toaster } from "sonner";
import CartSidebar from "@/components/cart/CartSidebar";
import { CartProvider, useCart } from "@/context/CartContext";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { cartCount, openCart, isCartOpen, closeCart, cartItems, updateQty, removeItem } = useCart();

  return (
    <>
      <Header />
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
export default function LayoutComponent({ children }: { children: React.ReactNode }) {
  return (
    <SessionWrapper>
      <CartProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </CartProvider>
    </SessionWrapper>
  );
}