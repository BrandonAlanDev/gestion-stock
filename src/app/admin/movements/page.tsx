"use client";

import { useEffect, useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getMovements } from "@/actions/movements";
import { ArrowUpCircle, ArrowDownCircle, Calendar, Package } from "lucide-react";

function getContrastColor(hexColor: string) {
  const r = parseInt(hexColor.slice(1, 3), 16) || 0;
  const g = parseInt(hexColor.slice(3, 5), 16) || 0;
  const b = parseInt(hexColor.slice(5, 7), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "black" : "white";
}

export default function MovementsPage() {
  const { pageConfig } = usePageConfig();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const background = pageConfig?.secondaryColor || "#00b4d8";
  const accent = pageConfig?.primaryColor || "#FFFFFF";
  const contrast = getContrastColor(background);

  useEffect(() => { getMovements().then(d => { setMovements(d); setLoading(false); }); }, []);

  return (

    <div style={{ backgroundColor: background, color: contrast, minHeight: "100vh" }} className=" p-6 sm:p-8 w-full mt-18 transition-colors duration-200">
      <div className="mb-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-black uppercase italic flex items-center gap-3">
          <span className="w-2 h-8 rounded-full" style={{ backgroundColor: accent }} />
          Historial de Movimientos
        </h1>
      </div>

      <div className="max-w-6xl mx-auto overflow-x-auto rounded-[1.0rem] bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/20 text-[9px] uppercase tracking-[0.3em] font-black opacity-70">
              <th className="px-8 py-6">Fecha</th>
              <th className="px-8 py-6">Producto</th>
              <th className="px-8 py-6 text-center">Tipo</th>
              <th className="px-8 py-6 text-right">Cantidad</th>
              <th className="px-8 py-6 text-right">Precio</th>
              <th className="px-8 py-6">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? <tr><td colSpan={6} className="text-center py-20 animate-pulse">Cargando...</td></tr> 
            : movements.map(m => (
              <tr key={m.id} className="hover:bg-black/10 transition-all">
                <td className="px-8 py-5 text-[10px] opacity-70">{new Date(m.createdAt).toLocaleDateString()}</td>
                <td className="px-8 py-5 font-bold">{m.garmentVariant?.garment?.name}</td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black ${m.type === 'IN' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {m.type}
                  </span>
                </td>
                <td className="px-8 py-5 text-right font-mono">{m.quantity}</td>
                <td className="px-8 py-5 text-right font-mono">${m.priceAtTime}</td>
                <td className="px-8 py-5 text-xs opacity-60 italic">{m.note || "---"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}