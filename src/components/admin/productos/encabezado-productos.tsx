"use client";

import { Plus } from "lucide-react";
import { CLASE_BOTON_PRIMARIO } from "@/lib/productos/estilos";

interface EncabezadoProductosProps {
  onAgregar: () => void;
}

export default function EncabezadoProductos({ onAgregar }: EncabezadoProductosProps) {
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
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button type="button" onClick={onAgregar} className={`${CLASE_BOTON_PRIMARIO} min-h-11 w-full justify-center sm:w-auto`}>
          <Plus size={16} />
          Agregar producto
        </button>
      </div>
    </div>
  );
}
