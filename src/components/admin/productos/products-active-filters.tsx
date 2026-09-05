"use client";

import { X } from "lucide-react";
import type { FiltrosProductos } from "@/lib/productos/query-params";
import type {
  CategoriaAdministracion,
  ProveedorAdministracion,
} from "@/types/productos/administracion-productos";

interface ProductsActiveFiltersProps {
  filtros: FiltrosProductos;
  categorias: CategoriaAdministracion[];
  proveedores: ProveedorAdministracion[];
  actualizar: (parcial: Partial<FiltrosProductos>) => void;
  limpiar: () => void;
}

const ETIQUETAS_STOCK: Record<string, string> = {
  "en-stock": "Con stock",
  "bajo-stock": "Stock bajo",
  "sin-stock": "Sin stock",
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  activo: "Activo",
  oculto: "Oculto",
};

export default function ProductsActiveFilters({
  filtros,
  categorias,
  proveedores,
  actualizar,
  limpiar,
}: ProductsActiveFiltersProps) {
  const chips: Array<{ clave: string; etiqueta: string; limpiar: () => void }> = [];

  if (filtros.busqueda) {
    chips.push({
      clave: "busqueda",
      etiqueta: `Buscar: ${filtros.busqueda}`,
      limpiar: () => actualizar({ busqueda: "", pagina: 1 }),
    });
  }
  if (filtros.categoriaId) {
    const nombre = categorias.find((c) => c.id === filtros.categoriaId)?.name;
    chips.push({
      clave: "categoria",
      etiqueta: `Categoría: ${nombre ?? filtros.categoriaId}`,
      limpiar: () => actualizar({ categoriaId: "", subcategoriaId: "", pagina: 1 }),
    });
  }
  if (filtros.subcategoriaId) {
    const nombre = categorias
      .find((c) => c.id === filtros.categoriaId)
      ?.subCategories?.find((s) => s.id === filtros.subcategoriaId)?.name;
    chips.push({
      clave: "subcategoria",
      etiqueta: `Subcategoría: ${nombre ?? filtros.subcategoriaId}`,
      limpiar: () => actualizar({ subcategoriaId: "", pagina: 1 }),
    });
  }
  if (filtros.proveedorId) {
    const nombre = proveedores.find((p) => p.id === filtros.proveedorId)?.name;
    chips.push({
      clave: "proveedor",
      etiqueta: `Proveedor: ${nombre ?? filtros.proveedorId}`,
      limpiar: () => actualizar({ proveedorId: "", pagina: 1 }),
    });
  }
  if (filtros.stock) {
    chips.push({
      clave: "stock",
      etiqueta: `Stock: ${ETIQUETAS_STOCK[filtros.stock] ?? filtros.stock}`,
      limpiar: () => actualizar({ stock: "", pagina: 1 }),
    });
  }
  if (filtros.estado) {
    chips.push({
      clave: "estado",
      etiqueta: `Estado: ${ETIQUETAS_ESTADO[filtros.estado] ?? filtros.estado}`,
      limpiar: () => actualizar({ estado: "", pagina: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.clave}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-1 text-xs font-medium text-[var(--admin-texto)]"
        >
          {chip.etiqueta}
          <button
            type="button"
            aria-label={`Quitar filtro ${chip.etiqueta}`}
            onClick={chip.limpiar}
            className="cursor-pointer text-[var(--admin-texto-suave)] transition hover:text-[var(--admin-texto)]"
          >
            <X size={13} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={limpiar}
        className="cursor-pointer text-xs font-medium text-[var(--admin-primario)] underline-offset-2 transition hover:underline"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
