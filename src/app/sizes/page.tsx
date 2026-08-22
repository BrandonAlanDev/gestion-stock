"use client";

import { useEffect, useState } from "react";
import { getSizeTypes, createSizeType, addSizeToType, deleteSize, deleteSizeType } from "@/actions/sizes";
import { Button } from "@/components/ui/button";
import { Ruler, Plus, Trash2, Layers, ChevronRight, Hash, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SizesPage() {
  const [sizeTypes, setSizeTypes] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Para feedback visual al borrar

  const fetchSizes = async () => {
    setLoading(true);
    const data = await getSizeTypes();
    setSizeTypes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return toast.error("Ingresa un nombre para el grupo");

    const res = await createSizeType(newTypeName);
    if (res.error) return toast.error(res.error);

    setNewTypeName("");
    fetchSizes();
    toast.success("Grupo de talles creado");
  };

  // FUNCIÓN PARA ELIMINAR GRUPO
  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`¿Borrar el grupo "${name}"?`)) return;
    
    setIsDeleting(id);
    const res = await deleteSizeType(id);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.info("Grupo eliminado");
      fetchSizes();
    }
    setIsDeleting(null);
  };

  // FUNCIÓN PARA ELIMINAR TALLE INDIVIDUAL
  const handleDeleteSize = async (id: string) => {
    const res = await deleteSize(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Talle eliminado");
      fetchSizes();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24">
        
        {/* Cabecera */}
        <div className="flex justify-between items-end border-b border-neutral-900 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Ruler className="text-amber-500" size={32} />
              Gestión de Talles
            </h1>
            <p className="text-neutral-500 text-xs uppercase tracking-[0.3em] mt-2 font-light">
              Configura las curvas de talles para tus categorías
            </p>
          </div>
        </div>

        {/* Formulario Crear Grupo */}
        <form 
          onSubmit={handleCreateGroup} 
          className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Layers size={14} /> Nuevo Grupo
          </h3>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 transition-all placeholder:text-neutral-700"
              placeholder="Nombre del grupo..."
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
            />
            <Button variant="amarillo" type="submit" className="font-bold uppercase tracking-tighter px-8 rounded-xl">
              Crear Grupo
            </Button>
          </div>
        </form>

        {/* Grilla de Grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading && sizeTypes.length === 0 ? (
            <div className="col-span-full text-center py-20 text-neutral-800 uppercase text-[10px] font-black tracking-[0.5em] animate-pulse">
              Sincronizando curvas...
            </div>
          ) : sizeTypes.map(type => (
            <div key={type.id} className="bg-neutral-950 border border-neutral-900 rounded-[2.5rem] p-6 space-y-6 hover:border-neutral-800 transition-all group">
              
              <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
                <h3 className="font-black text-lg italic uppercase tracking-tighter text-neutral-200 group-hover:text-amber-500 transition-colors flex items-center gap-2">
                  <ChevronRight size={18} className="text-amber-500" />
                  {type.name}
                </h3>
                <button 
                  onClick={() => handleDeleteGroup(type.id, type.name)}
                  disabled={isDeleting === type.id}
                  className="text-neutral-700 hover:text-red-500 transition-colors p-2 disabled:opacity-30"
                >
                  {isDeleting === type.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                </button>
              </div>

              {/* Tags de Talles Actuales */}
              <div className="flex flex-wrap gap-2 min-h-[50px]">
                {type.sizes.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 bg-black px-4 py-2 rounded-xl border border-neutral-800 group/item hover:border-red-500/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-600 font-bold uppercase leading-none">Talle</span>
                      <span className="text-sm font-black font-mono text-white leading-tight">{s.value}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteSize(s.id)}
                      className="text-neutral-800 hover:text-red-500 transition-colors ml-2 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulario Rápido para añadir talle */}
              <form 
                className="grid grid-cols-12 gap-2 pt-4 border-t border-neutral-900"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const val = (form.elements[0] as HTMLInputElement).value;
                  const ord = (form.elements[1] as HTMLInputElement).value;
                  
                  const res = await addSizeToType(type.id, val, parseInt(ord));
                  
                  if (res?.error) {
                    toast.error(res.error);
                  } else {
                    toast.success(`Talle ${val} agregado`);
                    form.reset();
                    fetchSizes();
                  }
                }}
              >
                <div className="col-span-6">
                  <input 
                    placeholder="Valor (XL)" 
                    className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500" 
                    required 
                  />
                </div>
                <div className="col-span-4 relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-700" size={12} />
                  <input 
                    type="number" 
                    placeholder="Orden" 
                    className="w-full bg-black border border-neutral-800 rounded-xl p-2.5 pl-7 text-xs text-white outline-none focus:border-amber-500" 
                    required 
                  />
                </div>
                <button type="submit" className="col-span-2 bg-neutral-900 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl flex items-center justify-center transition-all">
                  <Plus size={18} />
                </button>
              </form>
            </div>
          ))}
        </div>

        {!loading && sizeTypes.length === 0 && (
          <div className="text-center py-20 border border-dashed border-neutral-900 rounded-[2rem]">
            <p className="text-neutral-800 uppercase text-[10px] tracking-[0.3em] font-black">
              No has configurado ningún grupo de talles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}