import { getGarments } from "@/actions/garments";

import { getCategories } from "@/actions/garments";

import CatalogoClient from "@/components/products/views/CatalogoClient";

export default async function CatalogoPage() {
  // =========================================
  // DATA
  // =========================================

  const garments = await getGarments();

  const categories = await getCategories();

  // =========================================
  // RENDER
  // =========================================

  return (
    <CatalogoClient
      garments={garments}
      categories={categories}
    />
  );
}