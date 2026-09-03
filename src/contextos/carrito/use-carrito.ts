"use client";

import { useContext } from "react";
import { ContextoCarrito } from "@/contextos/carrito/contexto-carrito";

export function useCart() {
  const contexto = useContext(ContextoCarrito);

  if (!contexto) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return contexto;
}
