"use client";

import { useState, useEffect } from "react";
import { createBoardType, updateBoardType, deleteBoardType } from "@/actions/admin-personalizado";
import { X, Edit2, Trash2, Tag, Loader2, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";
import type {
  ModeloTabla,
  ColaTabla,
  QuillaTabla,
  ConfigQuillaTabla,
} from "@/types/personalizado";

interface ManageBoardTypeModalProps {
  boardType?: ModeloTabla;
  availableTails: ColaTabla[];
  availableFins: QuillaTabla[];
  availableConfigs: ConfigQuillaTabla[];
}

export default function ManageBoardTypeModal({ boardType, availableTails, availableFins, availableConfigs }: ManageBoardTypeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!boardType;

  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);
  const isDarkBg = textColor === "#ffffff";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const borderColor = textColor + "2E";
  const softBorder = textColor + "1A";
  const mutedText = textColor + "99";
  const chipBg = accent + "1A";

  const [formData, setFormData] = useState({
    name: boardType?.name || "",
    svgPath: boardType?.svgPath || "",
    tailIds: boardType?.allowedTails?.map((t) => t.id) || [] as string[],
    finIds: boardType?.allowedFins?.map((f) => f.id) || [] as string[],
    configIds: boardType?.allowedConfigs?.map((c) => c.id) || [] as string[],
  });

  useEffect(() => {
    if (boardType) {
      setFormData({
        name: boardType.name || "",
        svgPath: boardType.svgPath || "",
        tailIds: boardType.allowedTails?.map((t) => t.id) || [],
        finIds: boardType.allowedFins?.map((f) => f.id) || [],
        configIds: boardType.allowedConfigs?.map((c) => c.id) || [],
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
    if (!boardType) return;
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
      [key]: prev[key].includes(id) ? prev[key].filter((x: string) => x !== id) : [...prev[key], id],
    }));
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={isEdit ? "transition-colors hover:text-[var(--accent)]" : "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase hover:opacity-90 transition-colors shadow-xl"} style={{ color: isEdit ? textColor : accentTextColor, background: isEdit ? undefined : accent, "--accent": accent } as React.CSSProperties}>
        {isEdit ? <Edit2 size={16} /> : <><Plus size={16} /> Nuevo Modelo</>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="relative w-full max-w-2xl p-8 my-8" style={{ background, border: `1px solid ${borderColor}`, borderRadius: "2.5rem" }}>
            <div className="absolute top-0 left-8 w-16 h-2 rounded-b-lg" style={{ background: accent }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3" style={{ color: textColor }}>
                  <Tag style={{ color: accent }} /> {isEdit ? "Editar Modelo" : "Nuevo Modelo"}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: mutedText }} className="hover:opacity-70 transition-opacity"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase" style={{ color: mutedText, letterSpacing: "0.2em" }}>Nombre del Modelo</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Shortboard, Fish..." className={`w-full border rounded-2xl p-4 outline-none transition-all font-medium focus:ring-2 ${isDarkBg ? "focus:ring-white/40" : "focus:ring-black/30"}`} style={{ background: inputBg, borderColor, color: textColor }} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase" style={{ color: mutedText, letterSpacing: "0.2em" }}>SVG Path (Opcional)</label>
                  <input type="text" value={formData.svgPath} onChange={(e) => setFormData({ ...formData, svgPath: e.target.value })} placeholder="Ej: M30,4 C42,4..." className={`w-full border rounded-2xl p-4 outline-none transition-all font-medium focus:ring-2 ${isDarkBg ? "focus:ring-white/40" : "focus:ring-black/30"}`} style={{ background: inputBg, borderColor, color: textColor }} />
                </div>
              </div>

              {/* Colas */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase" style={{ color: mutedText, letterSpacing: "0.2em" }}>Colas Permitidas</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTails.map(tail => (
                    <button type="button" key={tail.id} onClick={() => toggleSelection("tailIds", tail.id)} className="flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all hover:border-[var(--accent)]" style={formData.tailIds.includes(tail.id) ? { borderColor: accent, background: chipBg, color: accent } : { borderColor, background: inputBg, color: mutedText, "--accent": accent } as React.CSSProperties}>
                      <div className="w-4 h-4 rounded flex items-center justify-center border" style={formData.tailIds.includes(tail.id) ? { background: accent, borderColor: accent } : { background: inputBg, borderColor }}>
                        {formData.tailIds.includes(tail.id) && <Check size={12} color={accentTextColor} />}
                      </div>
                      {tail.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quillas */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase" style={{ color: mutedText, letterSpacing: "0.2em" }}>Sistemas de Quillas Permitidos</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFins.map(fin => (
                    <button type="button" key={fin.id} onClick={() => toggleSelection("finIds", fin.id)} className="flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all hover:border-[var(--accent)]" style={formData.finIds.includes(fin.id) ? { borderColor: accent, background: chipBg, color: accent } : { borderColor, background: inputBg, color: mutedText, "--accent": accent } as React.CSSProperties}>
                      <div className="w-4 h-4 rounded flex items-center justify-center border" style={formData.finIds.includes(fin.id) ? { background: accent, borderColor: accent } : { background: inputBg, borderColor }}>
                        {formData.finIds.includes(fin.id) && <Check size={12} color={accentTextColor} />}
                      </div>
                      {fin.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Config Quillas */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase" style={{ color: mutedText, letterSpacing: "0.2em" }}>Configuraciones Permitidas</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableConfigs.map(config => (
                    <button type="button" key={config.id} onClick={() => toggleSelection("configIds", config.id)} className="flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all hover:border-[var(--accent)]" style={formData.configIds.includes(config.id) ? { borderColor: accent, background: chipBg, color: accent } : { borderColor, background: inputBg, color: mutedText, "--accent": accent } as React.CSSProperties}>
                      <div className="w-4 h-4 rounded flex items-center justify-center border" style={formData.configIds.includes(config.id) ? { background: accent, borderColor: accent } : { background: inputBg, borderColor }}>
                        {formData.configIds.includes(config.id) && <Check size={12} color={accentTextColor} />}
                      </div>
                      {config.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3 border-t" style={{ borderColor: softBorder }}>
                {isEdit && <button type="button" onClick={handleDelete} disabled={loading} className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"><Trash2 size={16} /> Eliminar</button>}
                <button type="submit" disabled={loading} className="flex-[2] flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase disabled:opacity-50" style={{ background: accent, color: accentTextColor }}>
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
