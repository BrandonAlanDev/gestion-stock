"use client";

import { toast } from "sonner";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, Package, Edit3 } from "lucide-react";
import { getGarmentById } from "@/actions/garments";
import { useProductForm } from "@/hooks/useProductForm";
import VariantRow from "@/components/providers/products/forms/VariantRow";
import ImageUploader from "@/components/providers/products/forms/ImageUploader";
import { CLASE_BOTON_PRIMARIO, CLASE_INPUT, colorOpcion } from "@/lib/productos/estilos";
import type {
  CategoriaAdministracion,
  ColorAdministracion,
  ProductoAdministracion,
  ProveedorAdministracion,
  TipoTallaAdministracion,
} from "@/types/productos/administracion-productos";

interface Props {
  categories: CategoriaAdministracion[];
  sizes: TipoTallaAdministracion[];
  providers: ProveedorAdministracion[];
  colors: ColorAdministracion[];
  garment?: ProductoAdministracion;
  onSuccess?: () => void;
  open?: boolean;
  onClose?: () => void;
}

const CLASE_SELECT_MODAL = `${CLASE_INPUT} cursor-pointer`;

export default function ProductModal({ categories, sizes, providers, colors, garment, onSuccess, open, onClose }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? !!open : internalOpen;

  const closeModal = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fullGarment, setFullGarment] = useState<ProductoAdministracion | null>(null);
  const garmentId = garment?.id;

  useEffect(() => {
    if (garmentId) {
      getGarmentById(garmentId).then((data) => {
        if (data) setFullGarment(data);
      });
    }
  }, [garmentId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    formData,
    isEdit,
    availableSubCategories,
    availableSizes,
    setField,
    handleCategoryChange,
    handleSubCategoryChange,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantCustomSize,
    addImages,
    removeImage,
    reorderImages,
    editarImagen,
    handleSubmit,
    resetForm,
  } = useProductForm({ garment: fullGarment || garment, categories, sizes });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await handleSubmit();
      if (res?.error) {
        toast.error(typeof res.error === "object" ? "Error de validación de datos" : res.error);
        return;
      }
      toast.success(isEdit ? "Producto actualizado" : "Producto creado");
      onSuccess?.();
      if (!isEdit) {
        resetForm();
      }
      closeModal();
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modal =
    isOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      >
        <div className="relative my-auto w-full max-w-4xl rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--admin-texto)]">
              {isEdit ? (
                <Edit3 size={20} className="text-[var(--admin-primario)]" />
              ) : (
                <Package size={20} className="text-[var(--admin-primario)]" />
              )}
              {isEdit ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Cerrar"
              className="cursor-pointer rounded-md p-2 text-[var(--admin-texto-suave)] transition hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 p-6">
            {/* Fila 1: Nombre, Categoría, Subcategoría */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                placeholder="Nombre"
                className={CLASE_INPUT}
                value={formData.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
              <select
                className={CLASE_SELECT_MODAL}
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
              >
                <option value="" style={colorOpcion()}>Categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={colorOpcion()}>{c.name}</option>
                ))}
              </select>
              <select
                className={`${CLASE_SELECT_MODAL} ${!formData.categoryId ? "opacity-40" : ""}`}
                value={formData.subCategoryId}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!formData.categoryId}
                required
              >
                <option value="" style={colorOpcion()}>Subcategoría...</option>
                {availableSubCategories.map((sc) => (
                  <option key={sc.id} value={sc.id} style={colorOpcion()}>{sc.name}</option>
                ))}
              </select>
            </div>

            {/* Fila 2: Precio base, Precio techo (maxPrice), Costo, Proveedor */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <input
                type="number"
                step="0.01"
                placeholder="Precio venta (Base)"
                className={`${CLASE_INPUT} font-semibold text-[var(--admin-primario)]`}
                value={formData.price}
                onChange={(e) => setField("price", e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Precio techo (Opcional)"
                className={CLASE_INPUT}
                value={formData.maxPrice || ""}
                onChange={(e) => setField("maxPrice", e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Precio costo"
                className={CLASE_INPUT}
                value={formData.cost}
                onChange={(e) => setField("cost", e.target.value)}
                required
              />
              <select
                className={CLASE_SELECT_MODAL}
                value={formData.supplierId}
                onChange={(e) => setField("supplierId", e.target.value)}
              >
                <option value="" style={colorOpcion()}>Proveedor...</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id} style={colorOpcion()}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <textarea
              placeholder="Descripción..."
              className={`${CLASE_INPUT} h-24 resize-none`}
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
            />

            {/* Variantes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--admin-borde)] pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-texto-suave)]">
                  Variantes
                </span>
                <button
                  type="button"
                  disabled={!formData.subCategoryId}
                  onClick={addVariant}
                  className={`flex items-center gap-1 text-[10px] font-bold uppercase transition ${
                    formData.subCategoryId
                      ? "cursor-pointer text-[var(--admin-primario)] hover:underline"
                      : "cursor-not-allowed text-[var(--admin-texto-suave)] opacity-40"
                  }`}
                >
                  + Agregar Variante
                </button>
              </div>

              <div className="space-y-3">
                {formData.variants.map((v, i) => (
                  <VariantRow
                    key={i}
                    variant={v}
                    index={i}
                    availableSizes={availableSizes}
                    colors={colors}
                    onRemove={removeVariant}
                    onUpdate={updateVariant}
                    onUpdateCustomSize={updateVariantCustomSize}
                  />
                ))}
              </div>
            </div>

            {/* Imágenes */}
            <ImageUploader
              images={formData.images}
              onAddImages={addImages}
              onRemoveImage={removeImage}
              onReorder={reorderImages}
              alEditarImagen={editarImagen}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`${CLASE_BOTON_PRIMARIO} w-full cursor-pointer`}
            >
              {loading ? "Procesando..." : isEdit ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </form>
        </div>
      </div>,
      document.body
    );

  const trigger = isEdit && !isControlled ? (
    <button
      onClick={() => setInternalOpen(true)}
      className="flex cursor-pointer items-center gap-1 text-xs font-semibold uppercase text-[var(--admin-primario)] hover:underline"
    >
      <Edit3 size={14} />
      Editar
    </button>
  ) : !isEdit ? (
    <button
      onClick={() => setInternalOpen(true)}
      className={CLASE_BOTON_PRIMARIO}
    >
      <Package size={16} />
      + Nuevo Producto
    </button>
  ) : null;

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}
