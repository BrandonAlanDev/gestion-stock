import { getMovements } from "@/actions/movements";
import { ArrowUpCircle, ArrowDownCircle, Calendar, Package } from "lucide-react";

interface PageConfigProps {
  config?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
  };
}

export default async function MovementsPage({ config }: PageConfigProps) {
  const movements = await getMovements();

  // Valores por defecto si la base de datos viene vacía
  const primary = config?.primaryColor || "#FFFFFF";
  const secondary = config?.secondaryColor || "#00b4d8";

  // Evaluamos si el fondo es blanco para mantener el contraste del texto base
  const isWhiteBg = primary.toUpperCase() === "#FFFFFF" || primary.toLowerCase() === "white";

  return (
    <div 
      style={{
        "--p-color": primary,
        "--s-color": secondary,
      } as React.CSSProperties}
      className="p-8 bg-[var(--p-color)] min-h-screen text-neutral-800 pt-24 transition-colors duration-200"
    >
      <div className="mb-12 max-w-6xl mx-auto">
        <h1 className={`text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3 ${isWhiteBg ? 'text-neutral-900' : 'text-white'}`}>
          <span className="w-2 h-8 bg-[var(--s-color)] rounded-full inline-block" />
          Historial de Movimientos
        </h1>
        <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1 ml-5">
          Registro completo de entradas y salidas de stock
        </p>
      </div>

      <div className="max-w-6xl mx-auto overflow-x-auto border border-neutral-200 rounded-[2.5rem] bg-white shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-400 text-[9px] uppercase tracking-[0.3em] font-black">
              <th className="px-8 py-6">Fecha</th>
              <th className="px-8 py-6 text-neutral-700">Producto / Variante</th>
              <th className="px-8 py-6 text-center">Tipo</th>
              <th className="px-8 py-6 text-right">Cantidad</th>
              <th className="px-8 py-6 text-right">Precio Unit.</th>
              <th className="px-8 py-6">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {movements.map((m: any) => (
              <tr key={m.id} className="hover:bg-neutral-50/50 transition-all text-sm">
                
                {/* FECHA */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-neutral-500 font-mono text-[10px]">
                    <Calendar size={12} className="text-neutral-400" />
                    {new Date(m.createdAt).toLocaleDateString('es-AR')} {new Date(m.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

                {/* PRODUCTO */}
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-neutral-800 uppercase tracking-tighter italic">
                      {m.garmentVariant.garment.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-black uppercase">
                      Talle: {m.garmentVariant.size?.value || (m.garmentVariant.attributes as any)?.customSize || "S/T"}
                    </span>
                  </div>
                </td>

                {/* TIPO (IN/OUT) */}
                <td className="px-8 py-5 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    m.type === 'IN' 
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}>
                    {m.type === 'IN' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                    {m.type === 'IN' ? 'Ingreso' : 'Egreso'}
                  </span>
                </td>

                {/* CANTIDAD */}
                <td className={`px-8 py-5 text-right font-mono font-bold ${m.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {m.type === 'IN' ? '+' : '-'}{m.quantity}
                </td>

                {/* PRECIO */}
                <td className="px-8 py-5 text-right font-mono text-neutral-600">
                  <span className="text-[10px] mr-1 opacity-50 text-neutral-400">$</span>
                  {Number(m.priceAtTime).toLocaleString('es-AR')}
                </td>

                {/* NOTA */}
                <td className="px-8 py-5 text-neutral-400 italic text-xs max-w-xs truncate">
                  {m.note || "---"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movements.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2.5rem]">
            <Package className="mx-auto text-neutral-300 mb-4" size={40} />
            <p className="text-neutral-400 uppercase text-[10px] font-black tracking-[0.5em]">
              No hay movimientos registrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}