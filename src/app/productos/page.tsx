"use client";

import { useCart } from "@/context/CartContext";
import ProductsPage from '@/components/catalogo/ProductsPage'; // Importa el componente que muestra todos los productos

export default function CatalogoPage() {
  const { addToCart } = useCart(); // Obtenemos la misma función del contexto

  return (
    <ProductsPage addToCart={addToCart} />
  );
}