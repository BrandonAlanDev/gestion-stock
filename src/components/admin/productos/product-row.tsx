"use client";

import ProductActions from "./product-actions";
import ProductImage from "./product-image";
import ProductStatusBadge from "./product-status-badge";
import { formatearMoneda } from "@/lib/productos/formato";
import { formatearNumero } from "@/lib/productos/formatear-numero";
import type { ProductoAdminRow } from "@/lib/productos/tipos";

interface ProductRowProps {
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

export default function ProductRow({
  producto,
  onEditar,
  onCambiarVisibilidad,
  onEliminar,
  onNavegar,
}: ProductRowProps) {
  const infoSecundaria =
    producto.subcategoria?.nombre ??
    (producto.cantidadVariantes > 0 ? `${formatearNumero(producto.cantidadVariantes)} variantes` : "Sin variantes");

  return (
    <tr className="border-b border-[var(--admin-borde)] transition-colors hover:bg-[var(--admin-fondo-hover)]">
      <td className="px-4 py-4">
        <button
          type="button"
          onClick={onNavegar}
          className="flex w-full cursor-pointer items-center gap-3 text-left"
        >
          <ProductImage src={producto.imagenPrincipal} alt={producto.nombre} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--admin-texto)]">
              {producto.nombre}
            </p>
            <p className="truncate text-xs text-[var(--admin-texto-suave)]">
              {infoSecundaria}
            </p>
          </div>
        </button>
      </td>

      <td className="px-4 py-4">
        {producto.categoria ? (
          <div>
            <p className="text-sm font-medium text-[var(--admin-texto)]">
              {producto.categoria.nombre}
            </p>
            {producto.subcategoria && (
              <p className="text-xs text-[var(--admin-texto-suave)]">
                {producto.subcategoria.nombre}
              </p>
            )}
          </div>
        ) : (
          <span className="text-sm text-[var(--admin-texto-suave)]">—</span>
        )}
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[var(--admin-texto)]">
        {textoPrecio(producto)}
      </td>

      <td className="px-4 py-4">
        <span
          className={`text-sm font-medium ${
            producto.stockTotal <= 0 ? "text-red-400" : "text-[var(--admin-texto)]"
          }`}
        >
          {formatearNumero(producto.stockTotal)}
        </span>
        {producto.cantidadVariantes > 1 && (
          <p className="text-xs text-[var(--admin-texto-suave)]">
            en {formatearNumero(producto.cantidadVariantes)} variantes
          </p>
        )}
      </td>

      <td className="px-4 py-4">
        <ProductStatusBadge activo={producto.activo} stockTotal={producto.stockTotal} />
      </td>

      <td className="px-4 py-4">
        <ProductActions
          producto={producto}
          onEditar={onEditar}
          onCambiarVisibilidad={onCambiarVisibilidad}
          onEliminar={onEliminar}
        />
      </td>
    </tr>
  );
}
