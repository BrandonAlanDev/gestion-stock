"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { ContextoCarrito } from "@/contextos/carrito/contexto-carrito";
import type {
  ItemCarrito,
  ProductoParaCarrito,
} from "@/contextos/carrito/tipos-carrito";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

interface PropiedadesCartProvider {
  children: ReactNode;
}

export function CartProvider({ children }: PropiedadesCartProvider) {
  const tenantId = useTenantId();
  const claveCarrito = `cart:${tenantId ?? "sin-tenant"}`;
  const claveMarcaTemporal = `cartTimestamp:${tenantId ?? "sin-tenant"}`;
  const [cartItems, setCartItems] = useState<ItemCarrito[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [claveCargada, setClaveCargada] = useState<string | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(claveCarrito);
      const datos: unknown = guardado ? JSON.parse(guardado) : [];
      setCartItems(Array.isArray(datos) ? (datos as ItemCarrito[]) : []);
    } catch {
      localStorage.removeItem(claveCarrito);
      localStorage.removeItem(claveMarcaTemporal);
      setCartItems([]);
    } finally {
      setClaveCargada(claveCarrito);
    }
  }, [claveCarrito, claveMarcaTemporal]);

  useEffect(() => {
    if (claveCargada !== claveCarrito) return;

    try {
      localStorage.setItem(claveCarrito, JSON.stringify(cartItems));
      localStorage.setItem(claveMarcaTemporal, String(Date.now()));
    } catch {
      // El carrito continúa disponible en memoria si el navegador bloquea storage.
    }
  }, [cartItems, claveCarrito, claveCargada, claveMarcaTemporal]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (producto: ProductoParaCarrito) => {
      const nuevoItem: ItemCarrito = {
        ...producto,
        uid: `${producto.id}-${Date.now()}`,
        qty: 1,
        specs: producto.specs ?? {},
      };

      setCartItems((anteriores) => [...anteriores, nuevoItem]);
      toast.success(`${producto.name} añadido al carrito`);
      openCart();
    },
    [openCart]
  );

  const updateQty = useCallback((uid: string, delta: number) => {
    setCartItems((anteriores) =>
      anteriores.map((item) =>
        item.uid === uid
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((uid: string) => {
    setCartItems((anteriores) =>
      anteriores.filter((item) => item.uid !== uid)
    );
    toast.info("Producto eliminado del carrito");
  }, []);

  const updateCartItemSpecs = useCallback(
    (uid: string, nuevasEspecificaciones: Record<string, unknown>) => {
      setCartItems((anteriores) =>
        anteriores.map((item) =>
          item.uid === uid ? { ...item, specs: nuevasEspecificaciones } : item
        )
      );
      toast.success("Especificaciones actualizadas");
    },
    []
  );

  const valor = useMemo(
    () => ({
      cartItems,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQty,
      removeItem,
      updateCartItemSpecs,
    }),
    [
      addToCart,
      cartItems,
      closeCart,
      isCartOpen,
      openCart,
      removeItem,
      updateCartItemSpecs,
      updateQty,
    ]
  );

  return (
    <ContextoCarrito.Provider value={valor}>
      {children}
    </ContextoCarrito.Provider>
  );
}
