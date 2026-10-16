"use client";

import { useState } from "react";
import { createSubCategory } from "@/actions/categorias/crear-subcategoria";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categoryId: string;
  sizeTypes: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export default function AddSubCategoryForm({ categoryId, sizeTypes, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [sizeTypeId, setSizeTypeId] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const res = await createSubCategory({
      name,
      categoryId,
      sizeTypeId: sizeTypeId || null,
    });
    setLoading(true); // Se mantiene consistente con tu renderizado
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Subcategoría vinculada");
      setName("");
      setSizeTypeId("");
      onSuccess?.();
    }
  };

  return (
    <form
      onSubmit={handleAdd}
      className="mt-4 space-y-3 border-t border-[var(--admin-borde)] pt-4"
    >
      <p
        className="mb-2 text-[9px] font-black uppercase tracking-widest text-[var(--admin-primario)]"
      >
        + Nuevo Subgrupo
      </p>

      <div className="flex flex-col gap-2">
        <input
          className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2.5 text-xs text-[var(--admin-texto)] outline-none transition-colors placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)]"
          placeholder="Nombre de la subcategoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex gap-2">
          <select
            className={`min-w-0 flex-1 cursor-pointer rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2.5 text-xs text-[var(--admin-texto)] outline-none transition-colors focus:border-[var(--admin-primario)] ${sizeTypeId ? "opacity-100" : "opacity-60"}`}
            value={sizeTypeId}
            onChange={(e) => setSizeTypeId(e.target.value)}
          >
            <option value="">Talle estándar...</option>
            {sizeTypes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading || !name}
            className="flex items-center justify-center rounded-xl bg-[var(--admin-primario)] p-2.5 text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--admin-fondo-hover)] disabled:text-[var(--admin-texto-suave)] disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </form>
  );
}
