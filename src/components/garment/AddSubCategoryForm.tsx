"use client";

import { useState } from "react";
import { createSubCategory } from "@/actions/garments";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  categoryId: string;
  sizeTypes: any[];
}

export default function AddSubCategoryForm({ categoryId, sizeTypes }: Props) {
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
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Subcategoría vinculada");
      setName("");
      setSizeTypeId("");
    }
  };

  return (
    <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-neutral-800/50 space-y-3">
      <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest mb-2">
        + Nuevo Subgrupo
      </p>
      <div className="flex flex-col gap-2">
        <input
          className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-neutral-700"
          placeholder="Nombre (ej: Neoprenes)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <select
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-[10px] text-neutral-400 outline-none cursor-pointer"
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
            className="bg-amber-500 hover:bg-amber-400 text-black p-2.5 rounded-xl transition-all disabled:opacity-30"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </form>
  );
}