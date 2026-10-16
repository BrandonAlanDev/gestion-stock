"use client";

import ManageCategoryModal from "@/components/categories/modals/ManageCategoryModal";
import AddSubCategoryForm from "@/components/categories/forms/AddSubCategoryForm";
import DeleteSubBtn from "@/components/categories/modals/DeleteSubBtn";
import { Tag, Layers, FolderDot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCategories } from "@/actions/categorias/obtener-categorias";
import { getSizeTypes } from "@/actions/talles/obtener-tipos-talle";
import type { CategoriaConSubs, TalleTipoConSizes } from "@/types/catalogos";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<CategoriaConSubs[]>([]);
  const [sizeTypes, setSizeTypes] = useState<TalleTipoConSizes[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshCategories = useCallback(async () => {
    const catData = await getCategories();
    setCategories(catData || []);
  }, []);

  useEffect(() => {
    Promise.all([getCategories(), getSizeTypes()]).then(([catData, sizeData]) => {
      setCategories(catData || []);
      setSizeTypes(sizeData || []);
      setMounted(true);
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-[var(--admin-fondo)] p-6 text-[var(--admin-texto)] sm:p-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between my-6 sm:my-12">
        <div>
          <h1
            className="flex items-center gap-3 text-3xl font-black uppercase italic text-[var(--admin-texto)]"
          >
            <Tag className="text-[var(--admin-primario)]" />
            Estructura de Catálogo
          </h1>
          <p
            className="mt-1 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--admin-texto-suave)]"
          >
            Gestión de categorías y subgrupos
          </p>
        </div>
        <ManageCategoryModal sizeTypes={sizeTypes} onCategoryChange={refreshCategories} />
      </div>

      {/* GRID DE CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative flex flex-col rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-6 shadow-sm"
          >
            {/* Badge + edit */}
            <div className="flex justify-between items-start mb-4">
              <div
                className="flex items-center gap-2 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-1 text-[9px] font-black uppercase text-[var(--admin-primario)]"
              >
                <FolderDot size={12} />
                Categoría Principal
              </div>
              <ManageCategoryModal sizeTypes={sizeTypes} category={cat} onCategoryChange={refreshCategories} />
            </div>

            {/* Nombre categoría */}
            <h3
              className="mb-6 text-2xl font-black uppercase italic text-[var(--admin-texto)]"
            >
              {cat.name}
            </h3>

            {/* Subcategorías */}
            <div className="flex-1 space-y-3">
              <h4
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--admin-texto-suave)]"
              >
                <Layers size={12} /> Subcategorías Actuales
              </h4>

              <div className="space-y-2" style={{ minHeight: "50px" }}>
                {cat.subCategories?.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3"
                  >
                    <div>
                      <p
                        className="text-xs font-bold uppercase text-[var(--admin-texto)]"
                      >
                        {sub.name}
                      </p>
                      <p
                        className="mt-0.5 text-[8px] font-black uppercase text-[var(--admin-primario)]"
                      >
                        {sub.sizeType?.name || "Talle Único"}
                      </p>
                    </div>
                    <DeleteSubBtn id={sub.id} onDeleted={refreshCategories} />
                  </div>
                ))}

                {(!cat.subCategories || cat.subCategories.length === 0) && (
                  <p className="px-1 text-[10px] italic text-[var(--admin-texto-suave)]">
                    No hay subcategorías registradas.
                  </p>
                )}
              </div>
            </div>

            {/* Formulario agregar subcategoría */}
            <div className="mt-6 border-t border-[var(--admin-borde)] pt-6">
              <AddSubCategoryForm categoryId={cat.id} sizeTypes={sizeTypes} onSuccess={refreshCategories} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
