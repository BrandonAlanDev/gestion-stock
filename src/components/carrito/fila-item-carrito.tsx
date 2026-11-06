"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contextos/carrito/use-carrito";
import type { ItemCarrito } from "@/contextos/carrito/tipos-carrito";

interface PropiedadesFilaItemCarrito {
  item: ItemCarrito;
}

export default function FilaItemCarrito({
  item,
}: PropiedadesFilaItemCarrito) {
  const { updateQty, removeItem } = useCart();
  const adicionPendiente = (item.adicionesPendientes?.length ?? 0) > 0;

  return (
    <div className="p-3 border rounded-xl flex gap-4 bg-[color-mix(in_srgb,var(--color-secundario)_50%,transparent)]">
      <Image
        src={item.image || "/images/placeholder.svg"}
        alt={item.name}
        width={60}
        height={60}
        className="rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="font-bold text-sm truncate">{item.name}</h3>
        {item.varianteInfo && Object.values(item.varianteInfo).filter(Boolean).length > 0 && (
          <p className="text-[11px] uppercase tracking-wide opacity-60 truncate">
            {Object.values(item.varianteInfo).filter(Boolean).join(" / ")}
          </p>
        )}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(item.uid, -1)}
              disabled={adicionPendiente}
              className="p-1 rounded bg-[color-mix(in_srgb,var(--color-fondo-sitio)_5%,transparent)]"
            >
              <Minus size={10} />
            </button>
            <span className="text-xs font-bold">{item.qty}</span>
            <button
              onClick={() => updateQty(item.uid, 1)}
              disabled={adicionPendiente || item.sinStock || (item.stock != null && item.qty >= item.stock)}
              aria-label={`Agregar una unidad de ${item.name}`}
              className="p-1 rounded bg-[color-mix(in_srgb,var(--color-fondo-sitio)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
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
        {item.sinStock && (
          <p
            role="status"
            className="mt-2 rounded-md px-2 py-1 text-[11px] font-medium"
            style={{
              color: "hsl(var(--destructive))",
              backgroundColor: "color-mix(in srgb, hsl(var(--destructive)) 8%, transparent)",
            }}
          >
            Sin stock disponible. Quitá el producto o reducí la cantidad.
          </p>
        )}
      </div>
    </div>
  );
}
