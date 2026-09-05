"use client";

import { Plus } from "lucide-react";
import { CLASE_BOTON_PRIMARIO } from "@/lib/productos/estilos";

interface ProductsHeaderProps {
  onAgregar: () => void;
}

export default function ProductsHeader({ onAgregar }: ProductsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-texto)]">
          Productos
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">
          Administrá todos los productos de tu tienda.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onAgregar} className={CLASE_BOTON_PRIMARIO}>
          <Plus size={16} />
          Agregar producto
        </button>
      </div>
    </div>
  );
}
