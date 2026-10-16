"use client";

import { useState, useEffect } from "react";
import { createCategory } from "@/actions/categorias/crear-categoria";
import { updateCategory } from "@/actions/categorias/actualizar-categoria";
import { deleteCategory } from "@/actions/categorias/eliminar-categoria";
import { X, Tag, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CategoryTriggerButton from "./CategoryTriggerButton";
import SubCategoryManager from "./SubCategoryManager";
import type { CategoriaConSubs, TalleTipoConSizes } from "@/types/catalogos";

interface ManageCategoryModalProps {
  sizeTypes: TalleTipoConSizes[];
  category?: CategoriaConSubs;
  onCategoryChange?: () => void;
}

export default function ManageCategoryModal({ sizeTypes, category, onCategoryChange }: ManageCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!category;

  const [formData, setFormData] = useState({ name: category?.name || "" });

  useEffect(() => {
    if (category) setFormData({ name: category.name || "" });
  }, [category]);

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isEdit
        ? await updateCategory(category.id, { name: formData.name })
        : await createCategory({ name: formData.name });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(isEdit ? "Categoría actualizada" : "Categoría creada");
        onCategoryChange?.();
        if (!isEdit) { setIsOpen(false); setFormData({ name: "" }); }
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!category) return;
    if (!confirm("¿Estás seguro de eliminar esta categoría y sus subgrupos asociados?")) return;
    setLoading(true);
    const res = await deleteCategory(category.id);
    setLoading(false);
    if (res?.error) { toast.error(res.error); }
    else { toast.success("Categoría eliminada"); setIsOpen(false); onCategoryChange?.(); }
  };

  return (
    <>
      <CategoryTriggerButton
        isEdit={isEdit}
        onOpen={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] text-[var(--admin-texto)] shadow-2xl"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-[var(--admin-primario)]" />

            <div className="p-4 space-y-6 sm:p-8">
              <div className="flex justify-between items-center gap-3">
                <h2
                  className="flex min-w-0 items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-[var(--admin-texto)]"
                >
                  <Tag className="shrink-0 text-[var(--admin-primario)]" size={24} />
                  {isEdit ? "Gestionar Estructura" : "Crear Categoría"}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 rounded-lg p-1 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-texto-suave)]"
                  >
                    Categoría Principal
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-4 py-3.5 text-sm font-medium text-[var(--admin-texto)] outline-none transition-colors placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)]"
                      value={formData.name}
                      onChange={e => setFormData({ name: e.target.value })}
                      placeholder="Ej: Ropa, Accesorios, Calzado"
                      required
                    />
                    {isEdit && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleDeleteCategory}
                        className="rounded-xl border border-[color-mix(in_srgb,var(--admin-peligro)_30%,transparent)] bg-[var(--admin-peligro-suave)] px-4 text-[var(--admin-peligro)] transition-colors hover:bg-[var(--admin-peligro-accion)] hover:text-white"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-black uppercase italic transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${isEdit ? "border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)] hover:opacity-90" : "bg-[var(--admin-primario)] text-[var(--admin-primario-texto)] hover:opacity-90"}`}
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {isEdit ? "Actualizar Nombre Principal" : "Crear Categoría Madre"}
                </button>
              </form>

              {isEdit && (
                <SubCategoryManager
                  category={category}
                  sizeTypes={sizeTypes}
                  onCategoryChange={onCategoryChange}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
