"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";

interface SizeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string) => Promise<void>;
  initialData?: { id: string; name: string } | null;
  colors?: { bg: string; accent: string; text: string; accentText: string };
}

export default function SizeTypeModal({ isOpen, onClose, onSave, initialData }: SizeTypeModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) setName(initialData.name);
    else setName("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(initialData?.id || "", name);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-6 text-[var(--admin-texto)] shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-[var(--admin-texto-suave)] transition-opacity hover:text-[var(--admin-texto)]">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black uppercase italic mb-6">
          Editar Grupo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-suave)]">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-3 text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-1 focus:ring-[var(--admin-primario)]"
              required
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
