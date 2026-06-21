"use client";

import { useEffect, useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getSizeTypes, createSizeType, addSizeToType, deleteSize, deleteSizeType } from "@/actions/sizes";
import { Ruler, Plus, Trash2, Layers, ChevronRight, Hash, Loader2 } from "lucide-react";
import { toast } from "sonner";

// --- UTILIDAD DE CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function SizesPage() {
  const { pageConfig } = usePageConfig();
  const [sizeTypes, setSizeTypes] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // INVERSIÓN: Fondo = secondary, Acento = primary
  const background = pageConfig?.secondaryColor || "#00b4d8";
  const accent = pageConfig?.primaryColor || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);

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
    if (res?.error) return toast.error(res.error);

    setNewTypeName("");
    fetchSizes();
    toast.success("Grupo de talles creado");
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`¿Borrar el grupo "${name}"?`)) return;
    setIsDeleting(id);
    const res = await deleteSizeType(id);
    if (res?.error) toast.error(res.error);
    else { toast.info("Grupo eliminado"); fetchSizes(); }
    setIsDeleting(null);
  };

  const handleDeleteSize = async (id: string) => {
    const res = await deleteSize(id);
    if (res?.error) toast.error(res.error);
    else { toast.success("Talle eliminado"); fetchSizes(); }
  };

  return (
    <div 
      style={{ backgroundColor: background, color: textColor, minHeight: "100vh" }}
      className="transition-colors duration-200 sm:p-8 w-full"
    >
      <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24">
        
        <div className="flex justify-between items-end border-b pb-6" style={{ borderColor: `${textColor}20` }}>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Ruler style={{ color: accent }} size={32} />
              Gestión de Talles
            </h1>
            <p className="text-opacity-60 text-xs uppercase tracking-[0.3em] mt-2 font-light" style={{ color: textColor }}>
              Configura las curvas de talles para tus categorías
            </p>
          </div>
        </div>

        <form 
          onSubmit={handleCreateGroup} 
          className="bg-black/10 border border-white/5 p-6 rounded-3xl shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent }} />
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: accent }}>
            <Layers size={14} /> Nuevo Grupo
          </h3>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm placeholder:opacity-50 focus:ring-1 outline-none"
              placeholder="Nombre del grupo (ej: Calzados, Remeras...)"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
            />
            <button 
              type="submit" 
              className="font-bold uppercase tracking-tighter px-8 rounded-xl hover:opacity-90 transition-all shadow-md text-sm"
              style={{ backgroundColor: accent, color: accentTextColor }}
            >
              Crear Grupo
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 animate-pulse">Sincronizando curvas...</div>
          ) : sizeTypes.map(type => (
            <div key={type.id} className="bg-black/10 border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-md transition-all">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="font-black text-lg italic uppercase tracking-tighter flex items-center gap-2">
                  <ChevronRight style={{ color: accent }} size={18} />
                  {type.name}
                </h3>
                <button onClick={() => handleDeleteGroup(type.id, type.name)} className="opacity-50 hover:text-red-500 transition-colors">
                  {isDeleting === type.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[50px]">
                {type.sizes.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                    <span className="text-xs font-black">{s.value}</span>
                    <button onClick={() => handleDeleteSize(s.id)} className="opacity-30 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}