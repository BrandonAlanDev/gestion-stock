"use client";

import { useState } from "react";
import { Layers, Plus, X, Loader2 } from "lucide-react";
import { createSubCategory } from "@/actions/categorias/crear-subcategoria";
import { deleteSubCategory } from "@/actions/categorias/eliminar-subcategoria";
import { toast } from "sonner";
import type { CategoriaConSubs, TalleTipoConSizes } from "@/types/catalogos";

interface SubCategoryManagerProps {
  category: CategoriaConSubs;
  sizeTypes: TalleTipoConSizes[];
  onCategoryChange?: () => void;
}

export default function SubCategoryManager({
  category,
  sizeTypes,
  onCategoryChange,
}: SubCategoryManagerProps) {
  const [subLoading, setSubLoading] = useState(false);
  const [subData, setSubData] = useState({ name: "", sizeTypeId: "" });

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subData.name.trim()) return;
    setSubLoading(true);
    try {
      const res = await createSubCategory({
        name: subData.name,
        sizeTypeId: subData.sizeTypeId || null,
        categoryId: category.id,
      });
      if (res?.error) { toast.error(res.error); }
      else { toast.success("Subcategoría añadida"); setSubData({ name: "", sizeTypeId: "" }); onCategoryChange?.(); }
    } catch {
      toast.error("Error al crear subcategoría");
    } finally {
      setSubLoading(false);
    }
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm("¿Eliminar esta subcategoría de forma permanente?")) return;
    const res = await deleteSubCategory(subId);
    if (res?.error) { toast.error(res.error); }
    else { toast.success("Subcategoría removida"); onCategoryChange?.(); }
  };

  return (
    <div className="space-y-4 border-t border-[var(--admin-borde)] pt-6">
      <h3
        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--admin-texto)]"
      >
        <Layers size={14} className="text-[var(--admin-primario)]" />
        Subcategorías y Curvas de Talles
      </h3>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {category.subCategories?.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-2.5"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase text-[var(--admin-texto)]">
                {sub.name}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--admin-texto-suave)]">
                Talles: {sub.sizeType?.name || "Estándar / Único"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteSub(sub.id)}
              className="rounded-md p-1 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-peligro-suave)] hover:text-[var(--admin-peligro)]"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {(!category.subCategories || category.subCategories.length === 0) && (
          <p className="pl-1 text-[11px] italic text-[var(--admin-texto-suave)]">
            No hay subcategorías en este grupo.
          </p>
        )}
      </div>

      <form
        onSubmit={handleAddSubCategory}
        className="space-y-3 rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-4"
      >
        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--admin-primario)]">
          + Vincular Subgrupo
        </span>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-4 py-3.5 text-sm font-medium text-[var(--admin-texto)] outline-none transition-colors placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)]"
            value={subData.name}
            onChange={e => setSubData({ ...subData, name: e.target.value })}
            placeholder="Nombre (Ej: Adultos)"
            required
          />
          <select
            className="w-full cursor-pointer rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-4 py-3.5 text-sm font-medium text-[var(--admin-texto)] outline-none transition-colors focus:border-[var(--admin-primario)]"
            value={subData.sizeTypeId}
            onChange={e => setSubData({ ...subData, sizeTypeId: e.target.value })}
          >
            <option value="">Curva estándar...</option>
            {sizeTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={subLoading || !subData.name}
          className="flex w-full items-center justify-center gap-1 rounded-xl bg-[var(--admin-primario)] py-2 text-[10px] font-extrabold uppercase tracking-wider text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {subLoading && <Loader2 className="animate-spin" size={12} />}
          <Plus size={12} /> Confirmar Subgrupo
        </button>
      </form>
    </div>
  );
}
