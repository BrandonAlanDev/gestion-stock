"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import ProductActions from "./product-actions";
import ProductImage from "./product-image";
import ProductStatusBadge from "./product-status-badge";
import ProductoVariantesSubfilas from "./producto-variantes-subfilas";
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
  return formatearMoneda(producto.precio);
}

export default function ProductRow({
  producto,
  onEditar,
  onCambiarVisibilidad,
  onEliminar,
  onNavegar,
}: ProductRowProps) {
  const [esExpandido, setEsExpandido] = useState(false);
  const esConVariantes = producto.esConVariantes === true;
  const infoSecundaria = esConVariantes
    ? `${formatearNumero(producto.cantidadVariantes)} variantes`
    : (producto.subcategoria?.nombre ?? "Sin variantes");

  const filaExpandida =
    esExpandido && esConVariantes ? (
      <tr className="border-b border-[var(--admin-borde)]">
        <td colSpan={6} className="bg-[var(--admin-fondo)] px-4 py-4">
          <ProductoVariantesSubfilas variantes={producto.variantes ?? []} />
        </td>
      </tr>
    ) : null;

  return (
    <>
      <tr className="border-b border-[var(--admin-borde)] transition-colors hover:bg-[var(--admin-fondo-hover)]">
        <td className="px-4 py-4">
          <div className="flex items-center gap-1">
            {esConVariantes && (
              <button
                type="button"
                aria-expanded={esExpandido}
                aria-label={esExpandido ? "Ocultar variantes" : "Mostrar variantes"}
                onClick={() => setEsExpandido((actual) => !actual)}
                className="shrink-0 cursor-pointer rounded p-1 text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)]"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${esExpandido ? "rotate-180" : ""}`}
                />
              </button>
            )}

            <button
              type="button"
              onClick={onNavegar}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
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
          </div>
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
          {producto.precioMaximo && producto.precioMaximo > producto.precio ? (
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-[var(--admin-texto-suave)] line-through">
                {formatearMoneda(producto.precioMaximo)}
              </span>
              <span>{formatearMoneda(producto.precio)}</span>
            </span>
          ) : (
            textoPrecio(producto)
          )}
        </td>

        <td className="px-4 py-4">
          {esConVariantes ? (
            <span className="text-sm font-medium text-[var(--admin-texto)]">
              {formatearNumero(producto.cantidadVariantes)} variantes
            </span>
          ) : (
            <span
              className={`text-sm font-medium ${
                producto.stockTotal <= 0 ? "text-red-400" : "text-[var(--admin-texto)]"
              }`}
            >
              {formatearNumero(producto.stockTotal)}
            </span>
          )}
        </td>

        <td className="px-4 py-4">
          <ProductStatusBadge
            activo={producto.activo}
            stockTotal={producto.stockTotal}
            esConVariantes={esConVariantes}
            variantes={producto.variantes}
          />
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

      {filaExpandida}
    </>
  );
}
