"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { toast } from "sonner";

// Define la forma de un item en el carrito y el contexto
interface CartItem {
  id: number;
  qty: number;
  // ...otras propiedades del producto
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: any) => void;
  updateQty: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  cartCount: number;
}

// Crea el contexto con un valor por defecto (puede ser undefined)
const CartContext = createContext<CartContextType | undefined>(undefined);

// Crea el Proveedor del Contexto
export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Efecto para cargar el carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("tech_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Efecto para guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    // Solo guardar si cartItems no es el array vacío inicial, para evitar sobreescribir al cargar
    if (cartItems.length > 0) {
       localStorage.setItem("tech_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: any) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === product.id);
      if (itemExists) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevItems, { ...product, qty: 1 }];
    });
    toast.success(`${product.name} añadido al carrito.`);
    setIsCartOpen(true);
  };

  const updateQty = (id: number, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const value = {
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    addToCart,
    updateQty,
    removeItem,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook personalizado para usar el contexto fácilmente
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}