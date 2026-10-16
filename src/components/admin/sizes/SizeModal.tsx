"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { id?: string; sizeTypeId: string; value: string; order: number }) => Promise<void>;
  sizeTypeId: string;
  initialData?: { id: string; value: string; order: number } | null;
  colors?: { bg: string; accent: string; text: string; accentText: string };
}

export default function SizeModal({ isOpen, onClose, onSave, sizeTypeId, initialData }: SizeModalProps) {
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
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-6 text-[var(--admin-texto)] shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-[var(--admin-texto-suave)] transition-opacity hover:text-[var(--admin-texto)]">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black uppercase italic mb-6">
          {initialData ? "Editar Talle" : "Nuevo Talle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-suave)]">Valor (ej: XL, 42)</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-3 text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-1 focus:ring-[var(--admin-primario)] uppercase"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-suave)]">Orden de visualización</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-3 text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-1 focus:ring-[var(--admin-primario)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl bg-[var(--admin-fondo-suave)] px-5 py-2 text-sm font-bold text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[var(--admin-primario)] px-5 py-2 text-sm font-bold uppercase text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50"
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
