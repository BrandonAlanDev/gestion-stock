"use client";

import { toast } from "sonner";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, Package, Edit3 } from "lucide-react";
import { useProductForm } from "@/hooks/useProductForm";
import VariantRow from "@/components/products/forms/VariantRow";
import ImageUploader from "@/components/products/forms/ImageUploader";

/* ── Paleta ──────────────────---─────────────────────────────────
   #ffffff   blanco — fondos principales
   #f0fafa   cyan muy claro — fondos suaves
   #e0f5f5   cyan claro — inputs, variantes
   #b2dede   cyan borde
   #4ab8b8   cyan acento
   #0d5c63   verde marino — detalles, iconos
   #083d42   verde marino oscuro — títulos
   #0d2b2e   texto principal
   #4a7c80   texto secundario
─────────────────────────────────────────────────────────────────── */

// ── Estilos reutilizables ──────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#f0fafa",
  border: "1px solid #b2dede",
  borderRadius: "12px",
  padding: "12px",
  fontSize: "14px",
  color: "#0d2b2e",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

export default function ProductModal({ categories, sizes, providers, colors, garment }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
    handleSubmit,
  } = useProductForm({ garment, categories, sizes });

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
      setIsOpen(false);
    } catch (error) {
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
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: "rgba(7,26,24,0.75)", backdropFilter: "blur(6px)" }}
      >
        <div
          className="w-full max-w-4xl my-auto shadow-2xl relative"
          style={{ background: "#ffffff", border: "1px solid #b2dede", borderRadius: "24px" }}
        >
          {/* Header */}
          <div
            className="p-6 flex justify-between items-center sticky top-0 z-10"
            style={{
              borderBottom: "1px solid #b2dede",
              background: "#ffffff",
              borderRadius: "24px 24px 0 0",
            }}
          >
            <h2
              className="text-xl font-black uppercase italic flex items-center gap-2"
              style={{ color: "#083d42" }}
            >
              {isEdit
                ? <Edit3 size={20} style={{ color: "#0d5c63" }} />
                : <Package size={20} style={{ color: "#0d5c63" }} />}
              {isEdit ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ color: "#4a7c80" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#083d42")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#4a7c80")}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-6">

            {/* Fila 1: Nombre, Categoría, Subcategoría */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Nombre"
                style={inputStyle}
                value={formData.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
              <select
                style={selectStyle}
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
              >
                <option value="">Categoría...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                style={{ ...selectStyle, opacity: !formData.categoryId ? 0.5 : 1 }}
                value={formData.subCategoryId}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!formData.categoryId}
                required
              >
                <option value="">Subcategoría...</option>
                {availableSubCategories.map((sc: any) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>

            {/* Fila 2: Precio venta, costo, proveedor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number" step="0.01" placeholder="Precio venta"
                style={{ ...inputStyle, color: "#0d5c63", fontWeight: 600 }}
                value={formData.price}
                onChange={(e) => setField("price", e.target.value)}
                required
              />
              <input
                type="number" step="0.01" placeholder="Precio costo"
                style={{ ...inputStyle, color: "#4a7c80", fontWeight: 600 }}
                value={formData.cost}
                onChange={(e) => setField("cost", e.target.value)}
                required
              />
              <select
                style={selectStyle}
                value={formData.supplierId}
                onChange={(e) => setField("supplierId", e.target.value)}
              >
                <option value="">Proveedor...</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Descripción */}
            <textarea
              placeholder="Descripción..."
              style={{ ...inputStyle, height: "96px", resize: "none" }}
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
            />

            {/* Variantes */}
            <div className="space-y-4">
              <div
                className="flex justify-between pb-2"
                style={{ borderBottom: "1px solid #b2dede" }}
              >
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: "#4a7c80" }}
                >
                  Variantes
                </span>
                <button
                  type="button"
                  disabled={!formData.subCategoryId}
                  onClick={addVariant}
                  className="text-[10px] font-bold uppercase transition-colors"
                  style={{ color: formData.subCategoryId ? "#0d5c63" : "#b2dede", cursor: formData.subCategoryId ? "pointer" : "not-allowed" }}
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
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-black uppercase transition-all"
              style={{
                background: loading ? "#b2dede" : "#0d5c63",
                color: "#ffffff",
                borderRadius: "16px",
                fontSize: "14px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#083d42"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#0d5c63"; }}
            >
              {loading ? "Procesando..." : isEdit ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </form>
        </div>
      </div>,
      document.body
    );

  const trigger = isEdit ? (
    <button
      onClick={() => setIsOpen(true)}
      className="text-[10px] font-bold uppercase transition-colors"
      style={{ color: "#4a7c80" }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#0d5c63")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#4a7c80")}
    >
      Editar
    </button>
  ) : (
    <button
      onClick={() => setIsOpen(true)}
      className="font-bold uppercase px-4 py-2 transition-all"
      style={{
        background: "#0d5c63",
        color: "#ffffff",
        borderRadius: "10px",
        fontSize: "13px",
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#083d42")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#0d5c63")}
    >
      + Nuevo Producto
    </button>
  );

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}