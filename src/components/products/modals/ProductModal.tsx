"use client";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, Package, Edit3 } from "lucide-react";
import { getGarmentById } from "@/actions/garments";
import { useProductForm } from "@/hooks/useProductForm";
import VariantRow from "@/components/products/forms/VariantRow";
import ImageUploader from "@/components/products/forms/ImageUploader";

interface Props {
  categories: any[];
  sizes: any[];
  providers: any[];
  colors: any[];
  garment?: any;
  onSuccess?: () => void;
}

// ── Estilos reutilizables adaptados a la paleta Cyan ───────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#f8fafc", // Fondo slate-50 más limpio
  border: "1px solid #c2f3f8", // Borde suave cyan
  borderRadius: "12px",
  padding: "12px",
  fontSize: "14px",
  color: "#0f172a", // Texto oscuro slate-900
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

export default function ProductModal({ categories, sizes, providers, colors, garment, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fullGarment, setFullGarment] = useState<any>(null);

  useEffect(() => {
    if (garment) {
      getGarmentById(garment.id).then(data => {
        if (data) setFullGarment(data);
      });
    }
  }, [garment?.id]);

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
    reorderImages,
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
        style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)" }} // Backdrop optimizado
      >
        <div
          className="w-full max-w-4xl my-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px" }}
        >
          {/* Header */}
          <div
            className="p-6 flex justify-between items-center sticky top-0 z-10"
            style={{
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
              borderRadius: "24px 24px 0 0",
            }}
          >
            <h2
              className="text-xl font-black uppercase italic flex items-center gap-2"
              style={{ color: "#0f172a" }}
            >
              {isEdit
                ? <Edit3 size={20} style={{ color: "#06b6d4" }} />
                : <Package size={20} style={{ color: "#06b6d4" }} />}
              {isEdit ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ color: "#94a3b8", transition: "color 0.2s" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#0f172a")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#94a3b8")}
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

            {/* Fila 2: Precio base, Precio techo (maxPrice), Costo, Proveedor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="number" step="0.01" placeholder="Precio venta (Base)"
                style={{ ...inputStyle, color: "#0891b2", fontWeight: 600 }}
                value={formData.price}
                onChange={(e) => setField("price", e.target.value)}
                required
              />
              <input
                type="number" step="0.01" placeholder="Precio techo (Opcional)"
                style={{ ...inputStyle, color: "#ef4444", fontWeight: 600 }}
                value={formData.maxPrice || ""}
                onChange={(e) => setField("maxPrice", e.target.value)}
              />
              <input
                type="number" step="0.01" placeholder="Precio costo"
                style={{ ...inputStyle, color: "#64748b", fontWeight: 600 }}
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
                style={{ borderBottom: "1px solid #e2e8f0" }}
              >
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: "#64748b" }}
                >
                  Variantes
                </span>
                <button
                  type="button"
                  disabled={!formData.subCategoryId}
                  onClick={addVariant}
                  className="text-[10px] font-bold uppercase transition-colors"
                  style={{ 
                    color: formData.subCategoryId ? "#06b6d4" : "#cbd5e1", 
                    cursor: formData.subCategoryId ? "pointer" : "not-allowed" 
                  }}
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
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-black uppercase tracking-wider text-sm transition-all shadow-md shadow-cyan-500/10"
              style={{
                background: loading ? "#c2f3f8" : "#06b6d4",
                color: "#ffffff",
                borderRadius: "16px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#0891b2"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#06b6d4"; }}
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
      style={{ color: "#64748b" }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#06b6d4")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#64748b")}
    >
      Editar
    </button>
  ) : (
    <button
      onClick={() => setIsOpen(true)}
      className="font-bold uppercase px-4 py-2 transition-all shadow-md shadow-cyan-500/10"
      style={{
        background: "#06b6d4",
        color: "#ffffff",
        borderRadius: "10px",
        fontSize: "13px",
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#0891b2")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#06b6d4")}
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