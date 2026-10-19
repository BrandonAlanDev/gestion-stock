"use client";

import ManageCategoryModal from "@/components/categories/modals/ManageCategoryModal";
import AddSubCategoryForm from "@/components/categories/forms/AddSubCategoryForm";
import DeleteSubBtn from "@/components/categories/modals/DeleteSubBtn";
import { Layers } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCategories } from "@/actions/categorias/obtener-categorias";
import { getSizeTypes } from "@/actions/talles/obtener-tipos-talle";
import type { CategoriaConSubs, TalleTipoConSizes } from "@/types/catalogos";
import { SkeletonAdmin } from "@/components/ui/skeleton-vistas";

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

  if (!mounted) return <SkeletonAdmin tipo="categorias" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Categorías</h1>
          <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">Organizá el catálogo y sus subcategorías.</p>
        </div>
        <ManageCategoryModal sizeTypes={sizeTypes} onCategoryChange={refreshCategories} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="admin-panel relative flex flex-col p-5"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-[var(--admin-texto-suave)]">Categoría</span>
              <ManageCategoryModal sizeTypes={sizeTypes} category={cat} onCategoryChange={refreshCategories} />
            </div>

            <h3 className="mb-5 text-lg font-semibold text-[var(--admin-texto)]">
              {cat.name}
            </h3>

            <div className="flex-1 space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-medium text-[var(--admin-texto-suave)]">
                <Layers size={14} /> Subcategorías
              </h4>

              <div className="space-y-2" style={{ minHeight: "50px" }}>
                {cat.subCategories?.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-[var(--admin-fondo)] p-3"
                  >
                    <div>
                      <p
                        className="text-sm font-medium text-[var(--admin-texto)]"
                      >
                        {sub.name}
                      </p>
                      <p
                        className="mt-0.5 text-xs text-[var(--admin-texto-suave)]"
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

            <div className="mt-5 border-t border-[var(--admin-borde)] pt-4">
              <AddSubCategoryForm categoryId={cat.id} sizeTypes={sizeTypes} onSuccess={refreshCategories} />
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && <div className="admin-panel p-8 text-center text-sm text-[var(--admin-texto-suave)]">Todavía no hay categorías. Creá la primera para organizar tus productos.</div>}
    </div>
  );
}
