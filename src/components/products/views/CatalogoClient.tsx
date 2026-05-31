"use client";

import { useCart } from "@/context/CartContext";
import ProductsPage from "@/components/products/views/ProductsPage";

interface Props {
  garments: any[];
  categories: any[];
  currentPage: number;
  totalPages: number;
}

export default function CatalogoClient({
  garments,
  categories,
  currentPage,
  totalPages,
}: Props) {
  const { addToCart } = useCart();

  return (
    <ProductsPage
      garments={garments}
      categories={categories}
      addToCart={addToCart}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}