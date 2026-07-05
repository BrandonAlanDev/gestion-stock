"use client";
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: number | string;
  qty: number;
  name: string;
  price: number;
  image?: string;
  specs?: any;
}

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tech_cart");
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tech_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Funciones de control de visibilidad
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: CartItem) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => String(i.id) === String(product.id));
      if (exists) {
        return prev.map((i) => String(i.id) === String(product.id) ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.name} añadido al carrito`);
    openCart();
  };

  const updateQty = (id: any, delta: number) => {
    setCartItems(prev => prev.map(i => String(i.id) === String(id) ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (id: any) => {
    setCartItems(prev => prev.filter(i => String(i.id) !== String(id)));
    toast.info("Producto eliminado del carrito");
  };

  const updateCartItemSpecs = (id: any, specs: any) => {
    setCartItems(prev => prev.map(i => String(i.id) === String(id) ? { ...i, specs } : i));
    toast.success("Especificaciones actualizadas");
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      isCartOpen, 
      setIsCartOpen, 
      openCart, 
      closeCart, 
      addToCart, 
      updateQty, 
      removeItem, 
      updateCartItemSpecs 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);