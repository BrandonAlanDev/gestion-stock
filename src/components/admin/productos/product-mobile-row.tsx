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

interface ProductMobileRowProps {
  producto: ProductoAdminRow;
  onEditar: () => void;
  onCambiarVisibilidad: () => void;
  onEliminar: () => void;
  onNavegar: () => void;
}

function textoPrecio(producto: ProductoAdminRow): string {
  return formatearMoneda(producto.precio);
}

export default function ProductMobileRow({
  producto,
  onEditar,
  onCambiarVisibilidad,
  onEliminar,
  onNavegar,
}: ProductMobileRowProps) {
  const [esExpandido, setEsExpandido] = useState(false);
  const esConVariantes = producto.esConVariantes === true;
  const categoriaTexto = [producto.categoria?.nombre, producto.subcategoria?.nombre]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="border-b border-[var(--admin-borde)] px-4 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onNavegar}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
        >
          <ProductImage src={producto.imagenPrincipal} alt={producto.nombre} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--admin-texto)]">
              {producto.nombre}
            </p>
            {categoriaTexto && (
              <p className="truncate text-xs text-[var(--admin-texto-suave)]">
                {categoriaTexto}
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
              {esConVariantes
                ? textoPrecio(producto)
                : `${textoPrecio(producto)} · Stock ${formatearNumero(producto.stockTotal)}`}
            </p>
            <div className="mt-1.5">
              <ProductStatusBadge
                activo={producto.activo}
                stockTotal={producto.stockTotal}
                esConVariantes={esConVariantes}
                variantes={producto.variantes}
              />
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

      {esConVariantes && (
        <button
          type="button"
          aria-expanded={esExpandido}
          aria-label={esExpandido ? "Ocultar variantes" : "Mostrar variantes"}
          onClick={() => setEsExpandido((actual) => !actual)}
          className="mt-3 flex w-full cursor-pointer items-center gap-1.5 text-left text-xs font-medium text-[var(--admin-texto-suave)] transition hover:text-[var(--admin-texto)]"
        >
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform ${esExpandido ? "rotate-180" : ""}`}
          />
          {esExpandido
            ? "Ocultar variantes"
            : `Ver ${formatearNumero(producto.cantidadVariantes)} variantes`}
        </button>
      )}

      {esExpandido && esConVariantes && (
        <div className="mt-3">
          <ProductoVariantesSubfilas variantes={producto.variantes ?? []} />
        </div>
      )}
    </div>
  );
}
