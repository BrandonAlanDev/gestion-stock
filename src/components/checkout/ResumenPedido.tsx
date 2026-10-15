"use client";

export interface ItemResumen {
  name: string;
  qty: number;
  price: number;
}

interface PropiedadesResumenPedido {
  items: ItemResumen[];
  subtotal: number;
  moneda: string;
}

export default function ResumenPedido({ items, subtotal, moneda }: PropiedadesResumenPedido) {
  return (
    <div
      className="rounded-xl border p-4 space-y-2"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-fondo-sitio) 90%, transparent)",
        borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 12%, transparent)",
      }}
    >
      <h2 className="text-lg font-bold">Resumen</h2>
      <ul className="space-y-2">
        {items.map((item, indice) => (
          <li key={indice} className="flex justify-between text-sm">
            <span className="truncate pr-2">
              {item.name} <span className="opacity-60">· x{item.qty}</span>
            </span>
            <span className="font-semibold">${(item.price * item.qty).toLocaleString("es-AR")}</span>
          </li>
        ))}
      </ul>
      <div
        className="border-t pt-2 flex justify-between items-center font-bold"
        style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 12%, transparent)" }}
      >
        <span>Total</span>
        <span>
          ${subtotal.toLocaleString("es-AR")} {moneda}
        </span>
      </div>
    </div>
  );
}
