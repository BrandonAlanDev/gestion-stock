"use client";

import { useState, useEffect } from "react";
import { createBoardType, updateBoardType, deleteBoardType } from "@/actions/admin-personalizado";
import { X, Edit2, Trash2, Tag, Loader2, Plus, Check } from "lucide-react";
import { toast } from "sonner";

interface ManageBoardTypeModalProps {
  boardType?: any;
  availableTails: any[];
  availableFins: any[];
  availableConfigs: any[];
}

export default function ManageBoardTypeModal({ boardType, availableTails, availableFins, availableConfigs }: ManageBoardTypeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!boardType;

  const [formData, setFormData] = useState({
    name: boardType?.name || "",
    svgPath: boardType?.svgPath || "",
    tailIds: boardType?.allowedTails?.map((t: any) => t.id) || [] as string[],
    finIds: boardType?.allowedFins?.map((f: any) => f.id) || [] as string[],
    configIds: boardType?.allowedConfigs?.map((c: any) => c.id) || [] as string[],
  });

  useEffect(() => {
    if (boardType) {
      setFormData({
        name: boardType.name || "",
        svgPath: boardType.svgPath || "",
        tailIds: boardType.allowedTails?.map((t: any) => t.id) || [],
        finIds: boardType.allowedFins?.map((f: any) => f.id) || [],
        configIds: boardType.allowedConfigs?.map((c: any) => c.id) || [],
      });
    }
  }, [boardType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        svgPath: formData.svgPath,
        tailIds: formData.tailIds,
        finIds: formData.finIds,
        configIds: formData.configIds,
      };
      const res = isEdit
        ? await updateBoardType(boardType.id, { ...payload, active: true })
        : await createBoardType(payload);

      if (res?.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Modelo actualizado" : "Modelo creado");
        if (!isEdit) {
          setIsOpen(false);
          setFormData({ name: "", svgPath: "", tailIds: [], finIds: [], configIds: [] });
        }
      }
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este modelo de tabla?")) return;
    setLoading(true);
    const res = await deleteBoardType(boardType.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else { toast.success("Modelo eliminado"); setIsOpen(false); }
  };

  const toggleSelection = (key: "tailIds" | "finIds" | "configIds", id: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((x) => x !== id) : [...prev[key], id],
    }));
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={isEdit ? "text-cyan-800 hover:text-cyan-600 transition-colors" : "flex items-center gap-2 bg-[#0d5c63] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase hover:bg-[#083d42] transition-colors shadow-xl shadow-[#0d5c63]/20"}>
        {isEdit ? <Edit2 size={16} /> : <><Plus size={16} /> Nuevo Modelo</>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(7,26,24,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="relative w-full max-w-2xl p-8 my-8" style={{ background: "#ffffff", border: "1px solid #b2dede", borderRadius: "2.5rem" }}>
            <div className="absolute top-0 left-8 w-16 h-2 rounded-b-lg" style={{ background: isEdit ? "#4ab8b8" : "#0d5c63" }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3" style={{ color: "#083d42" }}>
                  <Tag style={{ color: isEdit ? "#4ab8b8" : "#0d5c63" }} /> {isEdit ? "Editar Modelo" : "Nuevo Modelo"}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: "#4a7c80" }} className="hover:text-black"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase" style={{ color: "#4a7c80", letterSpacing: "0.2em" }}>Nombre del Modelo</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Shortboard, Fish..." className="w-full bg-[#f0fafa] border border-[#b2dede] rounded-2xl p-4 outline-none focus:border-[#0d5c63] transition-all font-medium" style={{ color: "#0d2b2e" }} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase" style={{ color: "#4a7c80", letterSpacing: "0.2em" }}>SVG Path (Opcional)</label>
                  <input type="text" value={formData.svgPath} onChange={(e) => setFormData({ ...formData, svgPath: e.target.value })} placeholder="Ej: M30,4 C42,4..." className="w-full bg-[#f0fafa] border border-[#b2dede] rounded-2xl p-4 outline-none focus:border-[#0d5c63] transition-all font-medium" style={{ color: "#0d2b2e" }} />
                </div>
              </div>

              {/* Colas */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase" style={{ color: "#4a7c80", letterSpacing: "0.2em" }}>Colas Permitidas</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTails.map(tail => (
                    <button type="button" key={tail.id} onClick={() => toggleSelection("tailIds", tail.id)} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${formData.tailIds.includes(tail.id) ? "border-[#0d5c63] bg-[#0d5c63]/10 text-[#0d5c63]" : "border-[#b2dede] bg-[#f0fafa] text-[#4a7c80] hover:border-[#0d5c63]"}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${formData.tailIds.includes(tail.id) ? "bg-[#0d5c63] border-[#0d5c63]" : "bg-white border-[#b2dede]"}`}>
                        {formData.tailIds.includes(tail.id) && <Check size={12} color="white" />}
                      </div>
                      {tail.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quillas */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase" style={{ color: "#4a7c80", letterSpacing: "0.2em" }}>Sistemas de Quillas Permitidos</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFins.map(fin => (
                    <button type="button" key={fin.id} onClick={() => toggleSelection("finIds", fin.id)} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${formData.finIds.includes(fin.id) ? "border-[#0d5c63] bg-[#0d5c63]/10 text-[#0d5c63]" : "border-[#b2dede] bg-[#f0fafa] text-[#4a7c80] hover:border-[#0d5c63]"}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${formData.finIds.includes(fin.id) ? "bg-[#0d5c63] border-[#0d5c63]" : "bg-white border-[#b2dede]"}`}>
                        {formData.finIds.includes(fin.id) && <Check size={12} color="white" />}
                      </div>
                      {fin.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Config Quillas */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase" style={{ color: "#4a7c80", letterSpacing: "0.2em" }}>Configuraciones Permitidas</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableConfigs.map(config => (
                    <button type="button" key={config.id} onClick={() => toggleSelection("configIds", config.id)} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${formData.configIds.includes(config.id) ? "border-[#0d5c63] bg-[#0d5c63]/10 text-[#0d5c63]" : "border-[#b2dede] bg-[#f0fafa] text-[#4a7c80] hover:border-[#0d5c63]"}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${formData.configIds.includes(config.id) ? "bg-[#0d5c63] border-[#0d5c63]" : "bg-white border-[#b2dede]"}`}>
                        {formData.configIds.includes(config.id) && <Check size={12} color="white" />}
                      </div>
                      {config.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3 border-t border-[#e0f5f5]">
                {isEdit && <button type="button" onClick={handleDelete} disabled={loading} className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase bg-red-50 text-red-600 disabled:opacity-50 hover:bg-red-100"><Trash2 size={16} /> Eliminar</button>}
                <button type="submit" disabled={loading} className="flex-[2] flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase text-white disabled:opacity-50" style={{ background: "#0d5c63" }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (isEdit ? "Guardar Modelo" : "Crear Modelo")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
