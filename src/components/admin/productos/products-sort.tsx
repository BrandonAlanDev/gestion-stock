"use client";

import { ChevronDown } from "lucide-react";
import { CLASE_SELECT, colorOpcion } from "@/lib/productos/estilos";
import type { OrdenProducto } from "@/lib/productos/tipos";

interface ProductsSortProps {
  valor: OrdenProducto;
  alCambiar: (orden: OrdenProducto) => void;
}

const OPCIONES: Array<{ valor: OrdenProducto; etiqueta: string }> = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "antiguos", etiqueta: "Más antiguos" },
  { valor: "nombre-asc", etiqueta: "Nombre A-Z" },
  { valor: "nombre-desc", etiqueta: "Nombre Z-A" },
  { valor: "precio-asc", etiqueta: "Precio menor" },
  { valor: "precio-desc", etiqueta: "Precio mayor" },
  { valor: "stock-asc", etiqueta: "Menor stock" },
  { valor: "stock-desc", etiqueta: "Mayor stock" },
];

export default function ProductsSort({ valor, alCambiar }: ProductsSortProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label="Ordenar por"
        value={valor}
        onChange={(e) => alCambiar(e.target.value as OrdenProducto)}
        className={CLASE_SELECT}
      >
        {OPCIONES.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor} style={colorOpcion()}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
      />
    </div>
  );
}
