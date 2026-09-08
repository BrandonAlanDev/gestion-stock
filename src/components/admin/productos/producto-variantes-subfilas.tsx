import { formatearMoneda } from "@/lib/productos/formato";
import { formatearNumero } from "@/lib/productos/formatear-numero";
import type { VarianteAdminResumen } from "@/lib/productos/tipos";

interface ProductoVariantesSubfilasProps {
  variantes: VarianteAdminResumen[];
}

export default function ProductoVariantesSubfilas({ variantes }: ProductoVariantesSubfilasProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {variantes.map((variante) => {
        const tienePrecioPropio = variante.precioOverride != null;

        return (
          <div
            key={variante.id}
            className="rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-medium text-[var(--admin-texto)]">
                {variante.nombre}
              </p>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--admin-primario)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-primario)]" />
                Stock {formatearNumero(variante.stock)}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-xs text-[var(--admin-texto-suave)]">
              <p>
                {tienePrecioPropio
                  ? `Precio: ${formatearMoneda(variante.precioOverride)}`
                  : "Usa precio general"}
              </p>
              {variante.sku && <p className="truncate">SKU: {variante.sku}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
