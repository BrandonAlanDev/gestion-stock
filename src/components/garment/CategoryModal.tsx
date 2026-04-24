"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Tag } from "lucide-react";
import { createCategory } from "@/actions/garments";
import { toast } from "sonner";

interface CategoryModalProps {
  sizeTypes: any[]; 
}

export default function CategoryModal({ sizeTypes }: CategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [sizeTypeId, setSizeTypeId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCategory({ name, sizeTypeId });
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Categoría creada");
      setIsOpen(false);
      setName("");
      setSizeTypeId("");
    }
  };

  if (!isOpen) return (
    <Button variant="outline" onClick={() => setIsOpen(true)} className="border-neutral-800 text-neutral-400 hover:text-white uppercase text-[10px] font-bold rounded-xl">
      Categorías
    </Button>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-3xl shadow-2xl">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Tag size={16} className="text-amber-500" /> Nueva Categoría
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-neutral-500">Nombre</label>
            <input required className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-neutral-500">Curva de Talles (Opcional)</label>
            <select className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none" value={sizeTypeId} onChange={e => setSizeTypeId(e.target.value)}>
              <option value="">Ninguna</option>
              {sizeTypes.map((type: any) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading} variant="amarillo" className="w-full py-6 font-black uppercase text-xs rounded-2xl">
            {loading ? "Creando..." : "Guardar Categoría"}
          </Button>
        </form>
      </div>
    </div>
  );
}