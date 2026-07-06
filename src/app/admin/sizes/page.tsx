"use client";

import { useEffect, useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { 
  getSizeTypes, 
  createSizeType, 
  updateSizeType,
  deleteSizeType, 
  addSizeToType, 
  updateSize,
  deleteSize 
} from "@/actions/sizes";
import { Ruler, Plus, Trash2, Edit, Layers, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SizeTypeModal from "@/components/admin/sizes/SizeTypeModal";
import SizeModal from "@/components/admin/sizes/SizeModal";

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

  // Estados de modales
  const [typeModal, setTypeModal] = useState<{ isOpen: boolean; data: any | null }>({ isOpen: false, data: null });
  const [sizeModal, setSizeModal] = useState<{ isOpen: boolean; typeId: string; data: any | null }>({ isOpen: false, typeId: "", data: null });

  // INVERSIÓN: Fondo = secondary, Acento = primary
  const background = pageConfig?.secondaryColor || "#00b4d8";
  const accent = pageConfig?.primaryColor || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);
  const colors = { bg: background, accent, text: textColor, accentText: accentTextColor };

  const fetchSizes = async () => {
    setLoading(true);
    const data = await getSizeTypes();
    setSizeTypes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  // --- HANDLERS: SIZE TYPES (GRUPOS) ---
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return toast.error("Ingresa un nombre para el grupo");

    const res = await createSizeType(newTypeName);
    if (res?.error) return toast.error(res.error);

    setNewTypeName("");
    fetchSizes();
    toast.success("Grupo de talles creado");
  };

  const handleUpdateGroup = async (id: string, name: string) => {
    const res = await updateSizeType(id, name);
    if (res?.error) toast.error(res.error);
    else { toast.success("Grupo actualizado"); fetchSizes(); }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`¿Borrar el grupo "${name}"?`)) return;
    setIsDeleting(id);
    const res = await deleteSizeType(id);
    if (res?.error) toast.error(res.error);
    else { toast.info("Grupo eliminado"); fetchSizes(); }
    setIsDeleting(null);
  };

  // --- HANDLERS: SIZES (TALLES) ---
  const handleSaveSize = async (data: { id?: string; sizeTypeId: string; value: string; order: number }) => {
    if (data.id) {
      const res = await updateSize(data.id, data.value, data.order);
      if (res?.error) {
        toast.error(res.error);
        return; // <-- Retorno vacío
      }
      toast.success("Talle actualizado");
    } else {
      const res = await addSizeToType(data.sizeTypeId, data.value, data.order);
      if (res?.error) {
        toast.error(res.error);
        return; // <-- Retorno vacío
      }
      toast.success("Talle agregado");
    }
    fetchSizes();
  };
  const handleDeleteSize = async (id: string) => {
    if (!confirm("¿Eliminar este talle?")) return;
    const res = await deleteSize(id);
    if (res?.error) toast.error(res.error);
    else { toast.success("Talle eliminado"); fetchSizes(); }
  };

  return (
    <div 
      style={{ backgroundColor: background, color: textColor, minHeight: "100vh" }}
      className="transition-colors duration-200 p-6 sm:p-8 pt-12 w-full"
    >
      <div className="p-8 max-w-6xl mx-auto space-y-8 pt-12">
        
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

        {/* Creador Rápido de Grupos */}
        <form 
          onSubmit={handleCreateGroup} 
          className="bg-black/10 border border-white/5 p-6 rounded-[1.0rem] shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent }} />
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: accent }}>
            <Layers size={14} /> Nuevo Grupo
          </h3>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-black/20 border border-white/10 rounded-[1.0rem] p-3 text-sm placeholder:opacity-50 focus:ring-1 outline-none"
              placeholder="Nombre del grupo (ej: Calzados, Remeras...)"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
            />
            <button 
              type="submit" 
              className="font-bold uppercase tracking-tighter px-8 rounded-[1.0rem] hover:opacity-90 transition-all shadow-md text-sm"
              style={{ backgroundColor: accent, color: accentTextColor }}
            >
              Crear Grupo
            </button>
          </div>
        </form>

        {/* Lista de Grupos y Curvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 animate-pulse">Sincronizando curvas...</div>
          ) : sizeTypes.map(type => (
            <div key={type.id} className="bg-black/10 border border-white/5 rounded-[1.0rem] p-6 space-y-6 shadow-md transition-all relative">
              
              {/* Header del Grupo */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="font-black text-lg italic uppercase tracking-tighter flex items-center gap-2">
                  <ChevronRight style={{ color: accent }} size={18} />
                  {type.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTypeModal({ isOpen: true, data: type })} 
                    className="opacity-50 hover:text-blue-400 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(type.id, type.name)} 
                    className="opacity-50 hover:text-red-500 transition-colors"
                  >
                    {isDeleting === type.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Talles del Grupo */}
              <div className="flex flex-wrap gap-2 min-h-[50px] items-center">
                {type.sizes
                  .sort((a: any, b: any) => a.order - b.order) // Ordenar por campo order
                  .map((s: any) => (
                  <div key={s.id} className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5 group">
                    <span className="text-xs font-black">{s.value}</span>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 gap-1 border-l border-white/10 pl-2">
                      <button onClick={() => setSizeModal({ isOpen: true, typeId: type.id, data: s })} className="hover:text-blue-400">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDeleteSize(s.id)} className="hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Botón Agregar Talle */}
                <button 
                  onClick={() => setSizeModal({ isOpen: true, typeId: type.id, data: null })}
                  className="flex items-center gap-1 bg-black/10 hover:bg-black/30 border border-dashed border-white/20 px-3 py-1.5 rounded-xl transition-all ml-1"
                >
                  <Plus size={12} />
                  <span className="text-xs font-bold opacity-70">Agregar</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Modales */}
      <SizeTypeModal 
        isOpen={typeModal.isOpen} 
        onClose={() => setTypeModal({ isOpen: false, data: null })} 
        initialData={typeModal.data}
        onSave={handleUpdateGroup}
        colors={colors}
      />
      
      <SizeModal 
        isOpen={sizeModal.isOpen} 
        onClose={() => setSizeModal({ isOpen: false, typeId: "", data: null })} 
        sizeTypeId={sizeModal.typeId}
        initialData={sizeModal.data}
        onSave={handleSaveSize}
        colors={colors}
      />

    </div>
  );
}