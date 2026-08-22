"use client";

import { useState, useEffect } from "react";
import {
  createDeliveryOption,
  updateDeliveryOption,
  deleteDeliveryOption,
} from "@/actions/admin-personalizado";
import { X, Edit2, Trash2, Clock, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageDeliveryModalProps {
  delivery?: any;
}

export default function ManageDeliveryModal({ delivery }: ManageDeliveryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!delivery;

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
        className={
          isEdit
            ? "text-cyan-800 hover:text-cyan-600 transition-colors"
            : "flex items-center gap-2 bg-[#0d5c63] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase hover:bg-[#083d42] transition-colors shadow-xl shadow-[#0d5c63]/20"
        }
      >
        {isEdit ? <Edit2 size={16} /> : <><Plus size={16} /> Nueva Opción</>}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(7,26,24,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="relative w-full max-w-md p-8"
            style={{ background: "#ffffff", border: "1px solid #b2dede", borderRadius: "2.5rem" }}
          >
            <div
              className="absolute top-0 left-8 w-16 h-2 rounded-b-lg"
              style={{ background: isEdit ? "#4ab8b8" : "#0d5c63" }}
            />

            <div className="flex justify-between items-start mb-6">
              <h2
                className="text-2xl font-black uppercase italic flex items-center gap-3"
                style={{ color: "#083d42" }}
              >
                <Clock style={{ color: isEdit ? "#4ab8b8" : "#0d5c63" }} />
                {isEdit ? "Editar Entrega" : "Nueva Opción de Entrega"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: "#4a7c80" }}
                className="hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Label */}
              <div className="space-y-2">
                <label
                  className="text-[10px] font-black uppercase"
                  style={{ color: "#4a7c80", letterSpacing: "0.2em" }}
                >
                  Tiempo de entrega *
                </label>
                <input
                  required
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Ej: 45-60 días hábiles"
                  className="w-full bg-[#f0fafa] border border-[#b2dede] rounded-2xl p-4 outline-none focus:border-[#0d5c63] transition-all font-medium"
                  style={{ color: "#0d2b2e" }}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label
                  className="text-[10px] font-black uppercase"
                  style={{ color: "#4a7c80", letterSpacing: "0.2em" }}
                >
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Temporada alta"
                  className="w-full bg-[#f0fafa] border border-[#b2dede] rounded-2xl p-4 outline-none focus:border-[#0d5c63] transition-all font-medium"
                  style={{ color: "#0d2b2e" }}
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
                    className="w-4 h-4 accent-[#0d5c63]"
                  />
                  <label
                    htmlFor="delivery-active"
                    className="text-xs font-bold uppercase"
                    style={{ color: "#4a7c80" }}
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
                    className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase bg-red-50 text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase text-white disabled:opacity-50"
                  style={{ background: "#0d5c63" }}
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
