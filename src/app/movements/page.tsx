import { getMovements } from "@/actions/movimientos/obtener-movimientos";
import { ArrowUpCircle, ArrowDownCircle, Calendar, Package } from "lucide-react";
import { nombreCombinacion } from "@/lib/productos/nombre-combinacion";

type Movimiento = Awaited<ReturnType<typeof getMovements>>["movements"][number];

function obtenerTallePersonalizado(atributos: unknown): string | null {
  if (typeof atributos !== "object" || atributos === null || !("customSize" in atributos)) return null;
  return typeof atributos.customSize === "string" ? atributos.customSize : null;
}

export default async function MovementsPage() {
  const { movements } = await getMovements(1, 100);

  return (
    <div className="p-8 bg-[var(--color-fondo-sitio)] min-h-screen text-[var(--texto-sobre-fondo)] pt-24">
      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-[var(--texto-sobre-fondo)] flex items-center gap-3">
          <span className="w-2 h-8 bg-[var(--color-primario)] rounded-full inline-block" />
          Historial de Movimientos
        </h1>
        <p className="text-[var(--texto-sobre-fondo)]/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1 ml-5">
          Registro completo de entradas y salidas de stock
        </p>
      </div>

      <div className="overflow-x-auto border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-[2.5rem] bg-[color-mix(in_srgb,var(--color-fondo-sitio)_40%,transparent)] backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] text-[var(--texto-sobre-fondo)]/50 text-[9px] uppercase tracking-[0.3em] font-black">
              <th className="px-8 py-6">Fecha</th>
              <th className="px-8 py-6 text-[var(--texto-sobre-fondo)]">Producto / Variante</th>
              <th className="px-8 py-6 text-center">Tipo</th>
              <th className="px-8 py-6 text-right">Cantidad</th>
              <th className="px-8 py-6 text-right">Precio Unit.</th>
              <th className="px-8 py-6">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)]">
            {movements.map((m: Movimiento) => (
              <tr key={m.id} className="hover:bg-[color-mix(in_srgb,var(--color-primario)_6%,transparent)] transition-all text-sm">
                {/* FECHA */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[var(--texto-sobre-fondo)]/60 font-mono text-[10px]">
                    <Calendar size={12} className="text-[var(--texto-sobre-fondo)]/50" />
                    {new Date(m.createdAt).toLocaleDateString('es-AR')} {new Date(m.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

                {/* PRODUCTO */}
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--texto-sobre-fondo)] uppercase tracking-tighter italic">
                      {m.garmentVariant.garment.name}
                    </span>
                    <span className="text-[10px] text-[var(--texto-sobre-fondo)]/60 font-black uppercase">
                      {nombreCombinacion(m.garmentVariant.optionValues) || m.garmentVariant.size?.value || obtenerTallePersonalizado(m.garmentVariant.attributes) || "S/T"}
                    </span>
                  </div>
                </td>

                {/* TIPO (IN/OUT) */}
                <td className="px-8 py-5 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    m.type === 'IN' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {m.type === 'IN' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                    {m.type === 'IN' ? 'Ingreso' : 'Egreso'}
                  </span>
                </td>

                {/* CANTIDAD */}
                <td className={`px-8 py-5 text-right font-mono font-bold ${m.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {m.type === 'IN' ? '+' : '-'}{m.quantity}
                </td>

                {/* PRECIO */}
                <td className="px-8 py-5 text-right font-mono text-[var(--texto-sobre-fondo)]/60">
                  <span className="text-[10px] mr-1 opacity-50">$</span>
                  {Number(m.priceAtTime).toLocaleString('es-AR')}
                </td>

                {/* NOTA */}
                <td className="px-8 py-5 text-[var(--texto-sobre-fondo)]/60 italic text-xs max-w-xs truncate">
                  {m.note || "---"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movements.length === 0 && (
          <div className="py-20 text-center">
            <Package className="mx-auto text-[var(--texto-sobre-fondo)]/30 mb-4" size={40} />
            <p className="text-[var(--texto-sobre-fondo)]/40 uppercase text-[10px] font-black tracking-[0.5em]">
              No hay movimientos registrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
