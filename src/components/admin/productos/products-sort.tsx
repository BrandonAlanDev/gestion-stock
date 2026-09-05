"use client";

import { ChevronDown } from "lucide-react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";
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
  const paleta = useAdminPaleta();

  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label="Ordenar por"
        value={valor}
        onChange={(e) => alCambiar(e.target.value as OrdenProducto)}
        className="appearance-none cursor-pointer rounded-xl py-2 pl-3 pr-8 text-sm font-medium outline-none"
        style={{
          backgroundColor: paleta.fondo,
          border: `1px solid ${paleta.borde}`,
          color: paleta.texto,
        }}
      >
        {OPCIONES.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor} style={{ backgroundColor: paleta.fondo, color: paleta.texto }}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
        style={{ color: paleta.texto }}
      />
    </div>
  );
}
