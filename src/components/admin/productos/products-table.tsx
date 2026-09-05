"use client";

import ProductMobileRow from "./product-mobile-row";
import ProductRow from "./product-row";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";
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
  const paleta = useAdminPaleta();

  const manejarEditar = (producto: ProductoAdminRow) => () => onEditar(producto);
  const manejarVisibilidad = (producto: ProductoAdminRow) => () => onCambiarVisibilidad(producto);
  const manejarEliminar = (producto: ProductoAdminRow) => () => onEliminar(producto);
  const manejarNavegar = (producto: ProductoAdminRow) => () => onNavegar(producto);

  return (
    <>
      <div
        className="hidden overflow-hidden rounded-xl border md:block"
        style={{ borderColor: paleta.borde }}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              className="border-b text-xs uppercase tracking-wide"
              style={{ borderColor: paleta.borde, color: paleta.textoSuave }}
            >
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

      <div className="overflow-hidden rounded-xl border md:hidden" style={{ borderColor: paleta.borde }}>
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
