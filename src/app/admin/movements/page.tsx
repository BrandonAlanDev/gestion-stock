"use client";

import { useEffect, useState } from "react";
import { getMovements } from "@/actions/movimientos/obtener-movimientos";

type Movimiento = Awaited<ReturnType<typeof getMovements>>["movements"][number];

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovements(1, 100).then((datos) => {
      setMovements(datos.movements);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[var(--admin-fondo)] p-6 text-[var(--admin-texto)] transition-colors duration-200 sm:p-8">
      <div className="my-12 max-w-6xl mx-auto">
        <h1 className="flex items-center gap-3 text-3xl font-black uppercase italic text-[var(--admin-texto)]">
          <span className="h-8 w-2 rounded-full bg-[var(--admin-primario)]" />
          Historial de Movimientos
        </h1>
      </div>

      <div className="mx-auto max-w-6xl overflow-x-auto rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] shadow-xl">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--admin-borde)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--admin-texto-suave)]">
              <th className="px-8 py-6">Fecha</th>
              <th className="px-8 py-6">Producto</th>
              <th className="px-8 py-6 text-center">Tipo</th>
              <th className="px-8 py-6 text-right">Cantidad</th>
              <th className="px-8 py-6 text-right">Precio</th>
              <th className="px-8 py-6">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-borde)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-[var(--admin-texto-suave)] animate-pulse">
                  Cargando...
                </td>
              </tr>
            ) : movements.map((movimiento) => (
              <tr key={movimiento.id} className="text-[var(--admin-texto)] transition-colors hover:bg-[var(--admin-fondo-hover)]">
                <td className="px-8 py-5 text-[10px] text-[var(--admin-texto-suave)]">{new Date(movimiento.createdAt).toLocaleDateString()}</td>
                <td className="px-8 py-5 font-bold">{movimiento.garmentVariant?.garment?.name}</td>
                <td className="px-8 py-5 text-center">
                  <span className={`rounded-full px-3 py-1 text-[9px] font-black ${movimiento.type === "IN" ? "bg-[var(--admin-exito-suave)] text-[var(--admin-exito)]" : "bg-[var(--admin-peligro-suave)] text-[var(--admin-peligro)]"}`}>
                    {movimiento.type}
                  </span>
                </td>
                <td className="px-8 py-5 text-right font-mono">{movimiento.quantity}</td>
                <td className="px-8 py-5 text-right font-mono">${movimiento.priceAtTime}</td>
                <td className="px-8 py-5 text-xs italic text-[var(--admin-texto-suave)]">{movimiento.note || "---"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
