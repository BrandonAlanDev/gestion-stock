"use client";

import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import MenuDesplegable, { type ItemMenu } from "@/components/ui/menu-desplegable";
import { AyudaEmergente } from "@/components/ui/ayuda-emergente";
import { CLASE_BOTON_ICONO } from "@/lib/productos/estilos";
import type { ProductoAdminRow } from "@/lib/productos/tipos";

interface AccionesProductoProps {
  producto: ProductoAdminRow;
  onEditar: () => void;
  onCambiarVisibilidad: () => void;
  onEliminar: () => void;
}

export default function AccionesProducto({
  producto,
  onEditar,
  onCambiarVisibilidad,
  onEliminar,
}: AccionesProductoProps) {
  const elementos: ItemMenu[] = [
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
      <AyudaEmergente contenido="Editar producto">
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
      </AyudaEmergente>

      <MenuDesplegable
        etiquetaAria="Más acciones"
        activador={
          <button type="button" aria-label="Más acciones" className={`${CLASE_BOTON_ICONO} cursor-pointer`}>
            <MoreHorizontal size={16} />
          </button>
        }
        elementos={elementos}
      />
    </div>
  );
}
