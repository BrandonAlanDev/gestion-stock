"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { id?: string; sizeTypeId: string; value: string; order: number }) => Promise<void>;
  sizeTypeId: string;
  initialData?: { id: string; value: string; order: number } | null;
  colors: { bg: string; accent: string; text: string; accentText: string };
}

export default function SizeModal({ isOpen, onClose, onSave, sizeTypeId, initialData, colors }: SizeModalProps) {
  const [value, setValue] = useState("");
  const [order, setOrder] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValue(initialData.value);
      setOrder(initialData.order.toString());
    } else {
      setValue("");
      setOrder("0");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      id: initialData?.id,
      sizeTypeId,
      value,
      order: parseInt(order) || 0,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl relative border border-white/10"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black uppercase italic mb-6">
          {initialData ? "Editar Talle" : "Nuevo Talle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Valor (ej: XL, 42)</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 outline-none focus:ring-1 uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Orden de visualización</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 outline-none focus:ring-1"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl bg-black/20 text-sm font-bold">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-bold uppercase flex items-center gap-2"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}