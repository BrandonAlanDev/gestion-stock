"use client";

import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import DropdownMenu, { type ItemMenu } from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { CLASE_BOTON_ICONO } from "@/lib/productos/estilos";
import type { ProductoAdminRow } from "@/lib/productos/tipos";

interface ProductActionsProps {
  producto: ProductoAdminRow;
  onEditar: () => void;
  onCambiarVisibilidad: () => void;
  onEliminar: () => void;
}

export default function ProductActions({
  producto,
  onEditar,
  onCambiarVisibilidad,
  onEliminar,
}: ProductActionsProps) {
  const items: ItemMenu[] = [
    { etiqueta: "Editar", icono: Pencil, onSeleccionar: onEditar },
    {
      etiqueta: producto.activo ? "Ocultar" : "Mostrar",
      icono: producto.activo ? EyeOff : Eye,
      onSeleccionar: onCambiarVisibilidad,
    },
    { etiqueta: "Eliminar", icono: Trash2, peligroso: true, onSeleccionar: onEliminar },
  ];

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip contenido="Editar producto">
        <button
          type="button"
          aria-label="Editar producto"
          onClick={(e) => {
            e.stopPropagation();
            onEditar();
          }}
          className={`${CLASE_BOTON_ICONO} cursor-pointer`}
        >
          <Pencil size={16} />
        </button>
      </Tooltip>

      <DropdownMenu
        ariaLabel="Más acciones"
        trigger={
          <button type="button" aria-label="Más acciones" className={`${CLASE_BOTON_ICONO} cursor-pointer`}>
            <MoreHorizontal size={16} />
          </button>
        }
        items={items}
      />
    </div>
  );
}
