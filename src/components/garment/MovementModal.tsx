"use client";

import { useState } from "react";
import { createMovement } from "@/actions/movements";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { History, X, ArrowUpCircle, ArrowDownCircle, DollarSign, Info } from "lucide-react";

export default function MovementModal({ garments }: { garments: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    variantId: "",
    type: "IN" as "IN" | "OUT",
    quantity: 1,
    priceAtTime: 0,
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.variantId) return toast.error("Selecciona un producto");
    if (form.quantity <= 0) return toast.error("La cantidad debe ser mayor a 0");
    
    setLoading(true);
    const res = await createMovement(form);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Movimiento registrado con éxito");
      setIsOpen(false);
      setForm({ variantId: "", type: "IN", quantity: 1, priceAtTime: 0, note: "" });
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-amber-500 rounded-xl px-4 flex items-center gap-2 transition-all uppercase text-[10px] font-black tracking-widest"
      >
        <History size={16} /> Movimientos
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${form.type === 'IN' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Registro de Stock</h2>
                <button type="button" onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* SELECTOR DE TIPO */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setForm({ ...form, type: "IN" })} 
                  className={`p-3 rounded-2xl border font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${form.type === "IN" ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-black border-neutral-800 text-neutral-600"}`}
                >
                  <ArrowUpCircle size={14} /> Ingreso
                </button>
                <button 
                  type="button" 
                  onClick={() => setForm({ ...form, type: "OUT" })} 
                  className={`p-3 rounded-2xl border font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${form.type === "OUT" ? "bg-red-500/10 border-red-500 text-red-500" : "bg-black border-neutral-800 text-neutral-600"}`}
                >
                  <ArrowDownCircle size={14} /> Egreso
                </button>
              </div>

              <div className="space-y-4">
                {/* SELECTOR DE PRODUCTO Y VARIANTE */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-500 uppercase px-1">Producto / Talle</label>
                  <select 
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 appearance-none cursor-pointer" 
                    value={form.variantId} 
                    onChange={(e) => {
                      const vId = e.target.value;
                      const parent = garments.find(g => g.variants.some((v: any) => v.id === vId));
                      const variant = parent?.variants.find((v: any) => v.id === vId);
                      
                      setForm({ 
                        ...form, 
                        variantId: vId, 
                        priceAtTime: parent ? Number(parent.price) : 0 
                      });
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {garments.map((g) => g.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {g.name} - {v.size.value} (Stock: {v.stock})
                      </option>
                    )))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* CANTIDAD */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase px-1">Unidades</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" 
                      value={form.quantity} 
                      onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                  {/* PRECIO */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase px-1">Precio Unit.</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-3.5 text-neutral-500" />
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full bg-black border border-neutral-800 rounded-xl p-3 pl-8 text-sm text-white outline-none focus:border-amber-500" 
                        value={form.priceAtTime} 
                        onChange={(e) => setForm({ ...form, priceAtTime: parseFloat(e.target.value) || 0 })} 
                      />
                    </div>
                  </div>
                </div>

                {/* NOTA */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-500 uppercase px-1">Nota / Motivo</label>
                  <input 
                    placeholder="Ej: Venta, Ajuste de inventario..." 
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500" 
                    value={form.note} 
                    onChange={(e) => setForm({ ...form, note: e.target.value })} 
                  />
                </div>
              </div>

              {/* RESUMEN VISUAL */}
              {form.variantId && (
                <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl flex items-center gap-3">
                   <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                      <Info size={16}/>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-neutral-500 uppercase leading-none">Total Operación</p>
                      <p className="text-white font-mono font-bold text-lg">
                        ${(form.quantity * form.priceAtTime).toLocaleString('es-AR')}
                      </p>
                   </div>
                </div>
              )}

              <Button 
                type="submit"
                disabled={loading || !form.variantId}
                className={`w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  form.type === 'IN' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {loading ? "Procesando..." : `Confirmar ${form.type === 'IN' ? 'Ingreso' : 'Egreso'}`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}