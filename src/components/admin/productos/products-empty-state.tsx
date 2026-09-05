"use client";

import { PackageOpen, Plus, SearchX } from "lucide-react";
import { CLASE_BOTON_OUTLINE, CLASE_BOTON_PRIMARIO } from "@/lib/productos/estilos";

interface ProductsEmptyStateProps {
  conFiltros: boolean;
  onAgregar?: () => void;
  onLimpiar?: () => void;
}

export default function ProductsEmptyState({ conFiltros, onAgregar, onLimpiar }: ProductsEmptyStateProps) {
  const Icono = conFiltros ? SearchX : PackageOpen;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="flex items-center justify-center rounded-full border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]"
        style={{ width: 80, height: 80 }}
      >
        <Icono size={40} className="text-[var(--admin-texto-suave)]" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-[var(--admin-texto)]">
        {conFiltros ? "No encontramos productos" : "No hay productos todavía"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--admin-texto-suave)]">
        {conFiltros
          ? "Probá cambiando la búsqueda o eliminando algunos filtros."
          : "Agregá tu primer producto para comenzar a administrar el catálogo."}
      </p>
      <div className="mt-6">
        {conFiltros ? (
          <button type="button" onClick={onLimpiar} className={CLASE_BOTON_OUTLINE}>
            Limpiar filtros
          </button>
        ) : (
          <button type="button" onClick={onAgregar} className={CLASE_BOTON_PRIMARIO}>
            <Plus size={16} />
            Agregar producto
          </button>
        )}
      </div>
    </div>
  );
}
