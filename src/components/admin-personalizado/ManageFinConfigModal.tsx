"use client";

import { useState, useEffect } from "react";
import { createBoardFinConfig, updateBoardFinConfig, deleteBoardFinConfig } from "@/actions/admin-personalizado";
import { X, Edit2, Trash2, Tag, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageFinConfigModalProps {
  config?: any;
}

export default function ManageFinConfigModal({ config }: ManageFinConfigModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!config;

  const [formData, setFormData] = useState({ name: config?.name || "", count: config?.count || 1 });

  useEffect(() => {
    if (config) setFormData({ name: config.name || "", count: config.count || 1 });
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isEdit
        ? await updateBoardFinConfig(config.id, { name: formData.name, count: Number(formData.count), active: true })
        : await createBoardFinConfig({ name: formData.name, count: Number(formData.count) });
      if (res?.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Config. actualizada" : "Config. creada");
        if (!isEdit) { setIsOpen(false); setFormData({ name: "", count: 1 }); }
      }
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta configuración?")) return;
    setLoading(true);
    const res = await deleteBoardFinConfig(config.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else { toast.success("Config. eliminada"); setIsOpen(false); }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={isEdit ? "text-cyan-800 hover:text-cyan-600 transition-colors" : "flex items-center gap-2 bg-[#0d5c63] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase hover:bg-[#083d42] transition-colors shadow-xl shadow-[#0d5c63]/20"}>
        {isEdit ? <Edit2 size={16} /> : <><Plus size={16} /> Nueva Config.</>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(7,26,24,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="relative w-full max-w-md p-8" style={{ background: "#ffffff", border: "1px solid #b2dede", borderRadius: "2.5rem" }}>
            <div className="absolute top-0 left-8 w-16 h-2 rounded-b-lg" style={{ background: isEdit ? "#4ab8b8" : "#0d5c63" }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3" style={{ color: "#083d42" }}>
                  <Tag style={{ color: isEdit ? "#4ab8b8" : "#0d5c63" }} /> {isEdit ? "Editar Config." : "Nueva Config."}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: "#4a7c80" }} className="hover:text-black"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase" style={{ color: "#4a7c80", letterSpacing: "0.2em" }}>Nombre</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Thruster, Quad..." className="w-full bg-[#f0fafa] border border-[#b2dede] rounded-2xl p-4 outline-none focus:border-[#0d5c63] transition-all font-medium" style={{ color: "#0d2b2e" }} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase" style={{ color: "#4a7c80", letterSpacing: "0.2em" }}>Cant. de Quillas</label>
                <input required type="number" min="0" max="6" value={formData.count} onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })} className="w-full bg-[#f0fafa] border border-[#b2dede] rounded-2xl p-4 outline-none focus:border-[#0d5c63] transition-all font-medium" style={{ color: "#0d2b2e" }} />
              </div>
              <div className="pt-6 flex gap-3">
                {isEdit && <button type="button" onClick={handleDelete} disabled={loading} className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase bg-red-50 text-red-600 disabled:opacity-50"><Trash2 size={16} /> Eliminar</button>}
                <button type="submit" disabled={loading} className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase text-white disabled:opacity-50" style={{ background: "#0d5c63" }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (isEdit ? "Guardar" : "Crear")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
