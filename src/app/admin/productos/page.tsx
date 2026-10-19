import { Suspense } from "react";
import PaginaProductos from "@/components/admin/productos/pagina-productos";
import CargandoProductos from "./loading";

export default function PaginaProductosAdmin() {
  return (
    <Suspense fallback={<CargandoProductos />}>
      <PaginaProductos />
    </Suspense>
  );
}
