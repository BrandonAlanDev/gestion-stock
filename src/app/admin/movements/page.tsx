"use client";

import { useEffect, useState } from "react";
import { getMovements } from "@/actions/movimientos/obtener-movimientos";
import { SkeletonFilas } from "@/components/ui/skeleton-vistas";

type Movimiento = Awaited<ReturnType<typeof getMovements>>["movements"][number];

function etiquetaTipo(tipo: string) {
  return tipo === "IN" ? "Entrada" : "Salida";
}

function colorTipo(tipo: string) {
  return tipo === "IN"
    ? "bg-[var(--admin-exito-suave)] text-[var(--admin-exito)]"
    : "bg-[var(--admin-peligro-suave)] text-[var(--admin-peligro)]";
}

export default function MovementsPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getMovements(1, 100)
      .then((datos) => setMovimientos(datos.movements))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
      <div className="mb-7">
        <h1>Movimientos de stock</h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">Entradas y salidas registradas en el inventario.</p>
      </div>

      {cargando ? (
        <SkeletonFilas filas={8} tipo="movimientos" />
      ) : error ? (
        <div className="admin-panel p-10 text-center text-sm text-[var(--admin-texto-suave)]">No se pudieron cargar los movimientos.</div>
      ) : movimientos.length === 0 ? (
        <div className="admin-panel p-10 text-center text-sm text-[var(--admin-texto-suave)]">Todavía no hay movimientos registrados.</div>
      ) : (
        <>
          <div className="admin-panel hidden overflow-hidden xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-hover)] text-xs font-medium text-[var(--admin-texto-suave)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 text-right font-medium">Cantidad</th>
                  <th className="px-5 py-3 text-right font-medium">Precio</th>
                  <th className="px-5 py-3 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-borde)]">
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-[var(--admin-fondo-hover)]">
                    <td className="px-5 py-4 text-[var(--admin-texto-suave)]">{new Date(movimiento.createdAt).toLocaleDateString("es-AR")}</td>
                    <td className="px-5 py-4 font-medium">{movimiento.garmentVariant?.garment?.name || "Producto eliminado"}</td>
                    <td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-xs font-medium ${colorTipo(movimiento.type)}`}>{etiquetaTipo(movimiento.type)}</span></td>
                    <td className="px-5 py-4 text-right tabular-nums">{movimiento.quantity}</td>
                    <td className="px-5 py-4 text-right tabular-nums">${movimiento.priceAtTime}</td>
                    <td className="px-5 py-4 text-[var(--admin-texto-suave)]">{movimiento.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 xl:hidden">
            {movimientos.map((movimiento) => (
              <article key={movimiento.id} className="admin-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{movimiento.garmentVariant?.garment?.name || "Producto eliminado"}</h2>
                    <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">{new Date(movimiento.createdAt).toLocaleDateString("es-AR")}</p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${colorTipo(movimiento.type)}`}>{etiquetaTipo(movimiento.type)}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--admin-borde)] pt-3 text-sm">
                  <div><span className="block text-xs text-[var(--admin-texto-suave)]">Cantidad</span><span className="font-medium tabular-nums">{movimiento.quantity}</span></div>
                  <div><span className="block text-xs text-[var(--admin-texto-suave)]">Precio</span><span className="font-medium tabular-nums">${movimiento.priceAtTime}</span></div>
                </div>
                {movimiento.note && <p className="mt-3 text-xs text-[var(--admin-texto-suave)]">{movimiento.note}</p>}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
