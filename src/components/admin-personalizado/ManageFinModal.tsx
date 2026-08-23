"use client";

import { useState, useEffect } from "react";
import { createBoardFin, updateBoardFin, deleteBoardFin } from "@/actions/admin-personalizado";
import { X, Edit2, Trash2, Tag, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";
import type { QuillaTabla } from "@/types/personalizado";

interface ManageFinModalProps {
  fin?: QuillaTabla;
}

export default function ManageFinModal({ fin }: ManageFinModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!fin;

  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);
  const isDarkBg = textColor === "#ffffff";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const borderColor = textColor + "2E";
  const mutedText = textColor + "99";

  const [formData, setFormData] = useState({ name: fin?.name || "" });

  useEffect(() => {
    if (fin) setFormData({ name: fin.name || "" });
  }, [fin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isEdit
        ? await updateBoardFin(fin.id, { name: formData.name, active: true })
        : await createBoardFin({ name: formData.name });
      if (res?.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Quilla actualizada" : "Quilla creada");
        if (!isEdit) { setIsOpen(false); setFormData({ name: "" }); }
      }
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!fin) return;
    if (!confirm("¿Eliminar este tipo de quilla?")) return;
    setLoading(true);
    const res = await deleteBoardFin(fin.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else { toast.success("Quilla eliminada"); setIsOpen(false); }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={isEdit ? "transition-colors hover:text-[var(--accent)]" : "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase hover:opacity-90 transition-colors shadow-xl"} style={{ color: isEdit ? textColor : accentTextColor, background: isEdit ? undefined : accent, "--accent": accent } as React.CSSProperties}>
        {isEdit ? <Edit2 size={16} /> : <><Plus size={16} /> Nueva Quilla</>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="relative w-full max-w-md p-8" style={{ background, border: `1px solid ${borderColor}`, borderRadius: "2.5rem" }}>
            <div className="absolute top-0 left-8 w-16 h-2 rounded-b-lg" style={{ background: accent }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3" style={{ color: textColor }}>
                  <Tag style={{ color: accent }} /> {isEdit ? "Editar Quilla" : "Nueva Quilla"}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: mutedText }} className="hover:opacity-70 transition-opacity"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase" style={{ color: mutedText, letterSpacing: "0.2em" }}>Nombre</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: FCS1, FCS2, Future" className={`w-full border rounded-2xl p-4 outline-none transition-all font-medium focus:ring-2 ${isDarkBg ? "focus:ring-white/40" : "focus:ring-black/30"}`} style={{ background: inputBg, borderColor, color: textColor }} />
              </div>
              <div className="pt-6 flex gap-3">
                {isEdit && <button type="button" onClick={handleDelete} disabled={loading} className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"><Trash2 size={16} /> Eliminar</button>}
                <button type="submit" disabled={loading} className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase disabled:opacity-50" style={{ background: accent, color: accentTextColor }}>
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
