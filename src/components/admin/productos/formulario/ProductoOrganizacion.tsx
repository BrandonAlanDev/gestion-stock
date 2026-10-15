"use client";

import CampoEtiquetas from "./CampoEtiquetas";
import SelectTemado from "@/components/ui/select-temado";
import type { CategoriaAdministracion } from "@/types/productos/administracion-productos";

interface Props {
  categorias: CategoriaAdministracion[];
  subcategorias: Array<{ id: string; name: string }>;
  categoryId: string;
  subCategoryId: string;
  etiquetas: string[];
  onChangeCategoria: (id: string) => void;
  onChangeSubcategoria: (id: string) => void;
  onAgregarEtiqueta: (etiqueta: string) => void;
  onEliminarEtiqueta: (etiqueta: string) => void;
}

export default function ProductoOrganizacion({
  categorias,
  subcategorias,
  categoryId,
  subCategoryId,
  etiquetas,
  onChangeCategoria,
  onChangeSubcategoria,
  onAgregarEtiqueta,
  onEliminarEtiqueta,
}: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--admin-texto)]">Organización</h3>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Categoría *</label>
          <SelectTemado
            valor={categoryId}
            opciones={categorias.map((categoria) => ({ valor: categoria.id, etiqueta: categoria.name }))}
            placeholder="Seleccionar categoría..."
            onCambiar={onChangeCategoria}
            ariaLabel="Categoría"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Subcategoría</label>
          <SelectTemado
            valor={subCategoryId}
            opciones={subcategorias.map((subcategoria) => ({ valor: subcategoria.id, etiqueta: subcategoria.name }))}
            placeholder="Sin subcategoría"
            onCambiar={onChangeSubcategoria}
            disabled={!categoryId}
            ariaLabel="Subcategoría"
          />
        </div>
        <CampoEtiquetas etiquetas={etiquetas} onAgregar={onAgregarEtiqueta} onEliminar={onEliminarEtiqueta} />
      </div>
    </section>
  );
}
