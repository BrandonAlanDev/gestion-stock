"use client";

import { useEffect, useState } from "react";
import { getSizeTypes, createSizeType, addSizeToType, deleteSize, deleteSizeType } from "@/actions/sizes";
import { Button } from "@/components/ui/button";
import { Ruler, Plus, Trash2, Layers, ChevronRight, Hash, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Definimos la interfaz basada en tu modelo PageConfig
interface PageConfigProps {
  config?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
  };
}

export default function SizesPage({ config }: PageConfigProps) {
  const [sizeTypes, setSizeTypes] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Valores por defecto si la base de datos viene vacía
  const primary = config?.primaryColor || "#FFFFFF";
  const secondary = config?.secondaryColor || "#00b4d8";

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

  const handleDeleteSize = async (id: string) => {
    const res = await deleteSize(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Talle eliminado");
      fetchSizes();
    }
  };

  // Detectamos si el fondo es blanco/claro para cambiar dinámicamente el color del texto base
  const isWhiteBg = primary.toUpperCase() === "#FFFFFF" || primary.toLowerCase() === "white";

  return (
    <div 
      style={{
        "--p-color": primary,
        "--s-color": secondary,
      } as React.CSSProperties}
      className="min-h-screen w-full bg-[var(--p-color)] text-neutral-800 transition-colors duration-200 selection:bg-[var(--s-color)]/20"
    >
      <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24">
        
        {/* Cabecera */}
        <div className="flex justify-between items-end border-b border-neutral-200 pb-6">
          <div>
            <h1 className={`text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3 ${isWhiteBg ? 'text-neutral-900' : 'text-white'}`}>
              <Ruler className="text-[var(--s-color)]" size={32} />
              Gestión de Talles
            </h1>
            <p className="text-neutral-400 text-xs uppercase tracking-[0.3em] mt-2 font-light">
              Configura las curvas de talles para tus categorías
            </p>
          </div>
        </div>

        {/* Formulario Crear Grupo */}
        <form 
          onSubmit={handleCreateGroup} 
          className="bg-neutral-50 border border-neutral-200 p-6 rounded-3xl shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--s-color)]" />
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-[var(--s-color)]">
            <Layers size={14} /> Nuevo Grupo
          </h3>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-white border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[var(--s-color)] focus:ring-1 focus:ring-[var(--s-color)] shadow-sm"
              placeholder="Nombre del grupo (ej: Calzados, Remeras...)"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-[var(--s-color)] text-white font-bold uppercase tracking-tighter px-8 rounded-xl hover:opacity-90 transition-all shadow-md text-sm"
            >
              Crear Grupo
            </button>
          </div>
        </form>

        {/* Grilla de Grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading && sizeTypes.length === 0 ? (
            <div className="col-span-full text-center py-20 text-neutral-400 uppercase text-[10px] font-black tracking-[0.5em] animate-pulse">
              Sincronizando curvas...
            </div>
          ) : sizeTypes.map(type => (
            <div key={type.id} className="bg-white border border-neutral-200 rounded-[2.5rem] p-6 space-y-6 shadow-md transition-all group hover:border-[var(--s-color)]/40">
              
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                <h3 className="font-black text-lg italic uppercase tracking-tighter text-neutral-800 group-hover:text-[var(--s-color)] transition-colors flex items-center gap-2">
                  <ChevronRight size={18} className="text-[var(--s-color)]" />
                  {type.name}
                </h3>
                <button 
                  onClick={() => handleDeleteGroup(type.id, type.name)}
                  disabled={isDeleting === type.id}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-2 disabled:opacity-30"
                >
                  {isDeleting === type.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                </button>
              </div>

              {/* Tags de Talles Actuales */}
              <div className="flex flex-wrap gap-2 min-h-[50px]">
                {type.sizes.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200 group/item hover:border-red-500/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase leading-none">Talle</span>
                      <span className="text-sm font-black font-mono text-neutral-800 Lech-tight">{s.value}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteSize(s.id)}
                      className="text-neutral-300 hover:text-red-500 transition-colors ml-2 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {type.sizes.length === 0 && (
                  <p className="text-neutral-400 italic text-xs self-center pl-2">No hay talles en este grupo</p>
                )}
              </div>

              {/* Formulario Rápido para añadir talle */}
              <form 
                className="grid grid-cols-12 gap-2 pt-4 border-t border-neutral-100"
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
                    placeholder="Valor (ej: XL, 42)" 
                    className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[var(--s-color)] focus:ring-1 focus:ring-[var(--s-color)]" 
                    required 
                  />
                </div>
                <div className="col-span-4 relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
                  <input 
                    type="number" 
                    placeholder="Orden" 
                    className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 pl-7 text-xs text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-[var(--s-color)] focus:ring-1 focus:ring-[var(--s-color)]" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="col-span-2 bg-neutral-100 text-neutral-600 hover:bg-[var(--s-color)] hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm border border-neutral-200/60"
                >
                  <Plus size={18} />
                </button>
              </form>
            </div>
          ))}
        </div>

        {!loading && sizeTypes.length === 0 && (
          <div className="text-center py-20 border border-dashed border-neutral-200 rounded-[2rem] bg-neutral-50/50">
            <p className="text-neutral-400 uppercase text-[10px] tracking-[0.3em] font-black">
              No has configurado ningún grupo de talles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}