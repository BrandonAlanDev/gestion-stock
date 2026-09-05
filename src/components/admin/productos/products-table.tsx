"use client";

import ProductMobileRow from "./product-mobile-row";
import ProductRow from "./product-row";
import { CLASE_SUPERFICIE } from "@/lib/productos/estilos";
import type { ProductoAdminRow } from "@/lib/productos/tipos";

interface ProductsTableProps {
  productos: ProductoAdminRow[];
  onEditar: (producto: ProductoAdminRow) => void;
  onCambiarVisibilidad: (producto: ProductoAdminRow) => void;
  onEliminar: (producto: ProductoAdminRow) => void;
  onNavegar: (producto: ProductoAdminRow) => void;
}

export default function ProductsTable({
  productos,
  onEditar,
  onCambiarVisibilidad,
  onEliminar,
  onNavegar,
}: ProductsTableProps) {
  const manejarEditar = (producto: ProductoAdminRow) => () => onEditar(producto);
  const manejarVisibilidad = (producto: ProductoAdminRow) => () => onCambiarVisibilidad(producto);
  const manejarEliminar = (producto: ProductoAdminRow) => () => onEliminar(producto);
  const manejarNavegar = (producto: ProductoAdminRow) => () => onNavegar(producto);

  return (
    <>
      <div className={`${CLASE_SUPERFICIE} hidden overflow-hidden md:block`}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--admin-borde)] text-xs uppercase tracking-wide text-[var(--admin-texto-suave)]">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <ProductRow
                key={producto.id}
                producto={producto}
                onEditar={manejarEditar(producto)}
                onCambiarVisibilidad={manejarVisibilidad(producto)}
                onEliminar={manejarEliminar(producto)}
                onNavegar={manejarNavegar(producto)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${CLASE_SUPERFICIE} overflow-hidden md:hidden`}>
        {productos.map((producto) => (
          <ProductMobileRow
            key={producto.id}
            producto={producto}
            onEditar={manejarEditar(producto)}
            onCambiarVisibilidad={manejarVisibilidad(producto)}
            onEliminar={manejarEliminar(producto)}
            onNavegar={manejarNavegar(producto)}
          />
        ))}
      </div>
    </>
  );
}
