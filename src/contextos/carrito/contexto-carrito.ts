"use client";

import { createContext } from "react";
import type { ValorContextoCarrito } from "@/contextos/carrito/tipos-carrito";

export const ContextoCarrito = createContext<ValorContextoCarrito | null>(null);
