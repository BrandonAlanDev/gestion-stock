"use client";
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  uid: string;
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

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: any) => {
    // Generar UID único para que cada vez que se agregue sea una fila nueva
    const newUid = `${product.id}-${Date.now()}`;
    const newItem = { ...product, uid: newUid, qty: 1, specs: product.specs || {} };
    
    setCartItems((prev) => [...prev, newItem]);
    toast.success(`${product.name} añadido al carrito`);
    openCart();
  };

  const updateQty = (uid: string, delta: number) => {
    setCartItems(prev => prev.map(i => i.uid === uid ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (uid: string) => {
    setCartItems(prev => prev.filter((i) => i.uid !== uid));
    toast.info("Producto eliminado del carrito");
  };

  const updateCartItemSpecs = (uid: string, newSpecs: any) => {
    setCartItems(prev => prev.map(i => i.uid === uid ? { ...i, specs: newSpecs } : i));
    toast.success("Especificaciones actualizadas");
  };

  return (
    <CartContext.Provider value={{ cartItems, isCartOpen, openCart, closeCart, addToCart, updateQty, removeItem, updateCartItemSpecs }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);