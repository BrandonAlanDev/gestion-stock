"use client";

import ProductActions from "./product-actions";
import ProductImage from "./product-image";
import ProductStatusBadge from "./product-status-badge";
import { formatearMoneda } from "@/lib/productos/formato";
import { formatearNumero } from "@/lib/productos/formatear-numero";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";
import type { ProductoAdminRow } from "@/lib/productos/tipos";

interface ProductMobileRowProps {
  producto: ProductoAdminRow;
  onEditar: () => void;
  onCambiarVisibilidad: () => void;
  onEliminar: () => void;
  onNavegar: () => void;
}

function textoPrecio(producto: ProductoAdminRow): string {
  if (producto.precioMaximo && producto.precioMaximo > producto.precio) {
    return `${formatearMoneda(producto.precio)} – ${formatearMoneda(producto.precioMaximo)}`;
  }
  return formatearMoneda(producto.precio);
}

export default function ProductMobileRow({
  producto,
  onEditar,
  onCambiarVisibilidad,
  onEliminar,
  onNavegar,
}: ProductMobileRowProps) {
  const paleta = useAdminPaleta();

  const categoriaTexto = [producto.categoria?.nombre, producto.subcategoria?.nombre]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="flex items-start gap-3 border-b last:border-b-0 px-4 py-4"
      style={{ borderColor: paleta.borde }}
    >
      <button type="button" onClick={onNavegar} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left">
        <ProductImage src={producto.imagenPrincipal} alt={producto.nombre} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" style={{ color: paleta.texto }}>
            {producto.nombre}
          </p>
          {categoriaTexto && (
            <p className="truncate text-xs" style={{ color: paleta.textoSuave }}>
              {categoriaTexto}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: paleta.textoSuave }}>
            {textoPrecio(producto)} · Stock {formatearNumero(producto.stockTotal)}
          </p>
          <div className="mt-1.5">
            <ProductStatusBadge activo={producto.activo} stockTotal={producto.stockTotal} />
          </div>
        </div>
      </button>

      <ProductActions
        producto={producto}
        onEditar={onEditar}
        onCambiarVisibilidad={onCambiarVisibilidad}
        onEliminar={onEliminar}
      />
    </div>
  );
}
