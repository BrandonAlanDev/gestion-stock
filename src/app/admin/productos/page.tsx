import { Suspense } from "react";
import PaginaProductos from "@/components/admin/productos/pagina-productos";

export default function PaginaProductosAdmin() {
  return (
    <Suspense fallback={null}>
      <PaginaProductos />
    </Suspense>
  );
}
