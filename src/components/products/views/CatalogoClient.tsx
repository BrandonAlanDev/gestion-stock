"use client";

import { useCart } from "@/context/CartContext";

import ProductsPage from "@/components/products/views/ProductsPage";

interface Props {
  garments: any[];
  categories: any[];
}

export default function CatalogoClient({
  garments,
  categories,
}: Props) {
  const { addToCart } = useCart();

  return (
    <ProductsPage
      garments={garments}
      categories={categories}
      addToCart={addToCart}
    />
  );
}