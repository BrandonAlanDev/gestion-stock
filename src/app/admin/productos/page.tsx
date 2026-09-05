import { Suspense } from "react";
import ProductsPage from "@/components/admin/productos/products-page";

export default function PaginaProductosAdmin() {
  return (
    <Suspense fallback={null}>
      <ProductsPage />
    </Suspense>
  );
}
