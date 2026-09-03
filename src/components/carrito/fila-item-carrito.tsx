"use client";

import Image from "next/image";
import { Minus, Plus, Settings, Trash2 } from "lucide-react";
import { useCart } from "@/contextos/carrito/use-carrito";
import type { ItemCarrito } from "@/contextos/carrito/tipos-carrito";

interface PropiedadesFilaItemCarrito {
  item: ItemCarrito;
  onEdit: () => void;
}

export default function FilaItemCarrito({
  item,
  onEdit,
}: PropiedadesFilaItemCarrito) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="p-3 border rounded-xl flex gap-4 bg-[color-mix(in_srgb,var(--color-secundario)_50%,transparent)]">
      <Image
        src={item.image || "/placeholder.png"}
        alt={item.name}
        width={60}
        height={60}
        className="rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="font-bold text-sm truncate">{item.name}</h3>
        {item.esTabla && (
          <button
            onClick={onEdit}
            className="text-[10px] flex items-center gap-1 opacity-60 hover:text-[var(--color-primario)]"
          >
            <Settings size={10} />
            {item.specs ? "Editar especificaciones" : "Configurar"}
          </button>
        )}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(item.uid, -1)}
              className="p-1 rounded bg-[color-mix(in_srgb,var(--color-fondo-sitio)_5%,transparent)]"
            >
              <Minus size={10} />
            </button>
            <span className="text-xs font-bold">{item.qty}</span>
            <button
              onClick={() => updateQty(item.uid, 1)}
              className="p-1 rounded bg-[color-mix(in_srgb,var(--color-fondo-sitio)_5%,transparent)]"
            >
              <Plus size={10} />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.uid)}
            className="text-red-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
