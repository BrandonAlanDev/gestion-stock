"use client";

import { useState, useEffect } from "react";
import {
  createDeliveryOption,
  updateDeliveryOption,
  deleteDeliveryOption,
} from "@/actions/admin-personalizado";
import { X, Edit2, Trash2, Clock, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";
import type { EntregaTabla } from "@/types/personalizado";

interface ManageDeliveryModalProps {
  delivery?: EntregaTabla;
}

export default function ManageDeliveryModal({ delivery }: ManageDeliveryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!delivery;

  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);
  const isDarkBg = textColor === "#ffffff";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const borderColor = textColor + "2E";
  const mutedText = textColor + "99";

  const [formData, setFormData] = useState({
    label: delivery?.label || "",
    description: delivery?.description || "",
    active: delivery?.active ?? true,
  });

  useEffect(() => {
    if (delivery) {
      setFormData({
        label: delivery.label || "",
        description: delivery.description || "",
        active: delivery.active ?? true,
      });
    }
  }, [delivery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      toast.error("El label es obligatorio.");
      return;
    }
    setLoading(true);
    try {
      const res = isEdit
        ? await updateDeliveryOption(delivery.id, {
            label: formData.label,
            description: formData.description,
            active: formData.active,
          })
        : await createDeliveryOption({
            label: formData.label,
            description: formData.description,
          });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(isEdit ? "Opción de entrega actualizada" : "Opción de entrega creada");
        if (!isEdit) {
          setIsOpen(false);
          setFormData({ label: "", description: "", active: true });
        }
      }
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!delivery) return;
    if (!confirm("¿Eliminar esta opción de entrega?")) return;
    setLoading(true);
    const res = await deleteDeliveryOption(delivery.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Opción de entrega eliminada");
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={isEdit ? "transition-colors hover:text-[var(--accent)]" : "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase hover:opacity-90 transition-colors shadow-xl"}
        style={{ color: isEdit ? textColor : accentTextColor, background: isEdit ? undefined : accent, "--accent": accent } as React.CSSProperties}
      >
        {isEdit ? <Edit2 size={16} /> : <><Plus size={16} /> Nueva Opción</>}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="relative w-full max-w-md p-8"
            style={{ background, border: `1px solid ${borderColor}`, borderRadius: "2.5rem" }}
          >
            <div
              className="absolute top-0 left-8 w-16 h-2 rounded-b-lg"
              style={{ background: accent }}
            />

            <div className="flex justify-between items-start mb-6">
              <h2
                className="text-2xl font-black uppercase italic flex items-center gap-3"
                style={{ color: textColor }}
              >
                <Clock style={{ color: accent }} />
                {isEdit ? "Editar Entrega" : "Nueva Opción de Entrega"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: mutedText }}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Label */}
              <div className="space-y-2">
                <label
                  className="text-[10px] font-black uppercase"
                  style={{ color: mutedText, letterSpacing: "0.2em" }}
                >
                  Tiempo de entrega *
                </label>
                <input
                  required
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Ej: 45-60 días hábiles"
                  className={`w-full border rounded-2xl p-4 outline-none transition-all font-medium focus:ring-2 ${isDarkBg ? "focus:ring-white/40" : "focus:ring-black/30"}`}
                  style={{ background: inputBg, borderColor, color: textColor }}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label
                  className="text-[10px] font-black uppercase"
                  style={{ color: mutedText, letterSpacing: "0.2em" }}
                >
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Temporada alta"
                  className={`w-full border rounded-2xl p-4 outline-none transition-all font-medium focus:ring-2 ${isDarkBg ? "focus:ring-white/40" : "focus:ring-black/30"}`}
                  style={{ background: inputBg, borderColor, color: textColor }}
                />
              </div>

              {/* Activo (solo en edición) */}
              {isEdit && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="delivery-active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: accent }}
                  />
                  <label
                    htmlFor="delivery-active"
                    className="text-xs font-bold uppercase"
                    style={{ color: mutedText }}
                  >
                    Activo (visible para clientes)
                  </label>
                </div>
              )}

              {/* Botones */}
              <div className="pt-6 flex gap-3">
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase disabled:opacity-50"
                  style={{ background: accent, color: accentTextColor }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isEdit ? (
                    "Guardar"
                  ) : (
                    "Crear"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
