"use client";

import { toast } from "sonner";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { X, Package, Edit3 } from "lucide-react";
import { getGarmentById } from "@/actions/garments";
import { useProductForm } from "@/hooks/useProductForm";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import VariantRow from "@/components/providers/products/forms/VariantRow";
import ImageUploader from "@/components/providers/products/forms/ImageUploader";

interface Props {
  categories: any[];
  sizes: any[];
  providers: any[];
  colors: any[];
  garment?: any;
  onSuccess?: () => void;
}

// --- UTILIDAD PARA CALCULAR EL CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function ProductModal({ categories, sizes, providers, colors, garment, onSuccess }: Props) {
  const pageConfig = usePageConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fullGarment, setFullGarment] = useState<any>(null);

  // Variables dinámicas de color
  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de legibilidad y contraste
  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";

  // Diseños de componentes basados en opacidad y contrastes dinámicos
  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const inputBg = isDarkBg ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
  const backdropBg = isDarkBg ? "rgba(0, 0, 0, 0.7)" : "rgba(15, 23, 42, 0.5)";

  // Configuración de estilos dinámicos de inputs y selectores
  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: inputBg,
    border: `1px solid ${overlayBorder}`,
    borderRadius: "12px",
    padding: "12px",
    fontSize: "14px",
    color: textColor,
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
  };

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
      loading && setLoading(false);
    }
  };

  if (!mounted) return null;

  const modal =
    isOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        style={{ backgroundColor: backdropBg, backdropFilter: "blur(6px)" }}
      >
        <div
          className="w-full max-w-4xl my-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
          style={{ backgroundColor: secondaryColor, border: `1px solid ${overlayBorder}`, borderRadius: "24px" }}
        >
          {/* Header */}
          <div
            className="p-6 flex justify-between items-center sticky top-0 z-10"
            style={{
              borderBottom: `1px solid ${overlayBorder}`,
              backgroundColor: secondaryColor,
              borderRadius: "24px 24px 0 0",
            }}
          >
            <h2
              className="text-xl font-black uppercase italic flex items-center gap-2"
              style={{ color: textColor }}
            >
              {isEdit
                ? <Edit3 size={20} style={{ color: primaryColor }} />
                : <Package size={20} style={{ color: primaryColor }} />}
              {isEdit ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: textColor }}
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
                <option value="" style={{ backgroundColor: secondaryColor }}>Categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: secondaryColor }}>{c.name}</option>
                ))}
              </select>
              <select
                style={{ ...selectStyle, opacity: !formData.categoryId ? 0.4 : 1 }}
                value={formData.subCategoryId}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!formData.categoryId}
                required
              >
                <option value="" style={{ backgroundColor: secondaryColor }}>Subcategoría...</option>
                {availableSubCategories.map((sc: any) => (
                  <option key={sc.id} value={sc.id} style={{ backgroundColor: secondaryColor }}>{sc.name}</option>
                ))}
              </select>
            </div>

            {/* Fila 2: Precio base, Precio techo (maxPrice), Costo, Proveedor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="number" step="0.01" placeholder="Precio venta (Base)"
                style={{ ...inputStyle, color: primaryColor, fontWeight: 700 }}
                value={formData.price}
                onChange={(e) => setField("price", e.target.value)}
                required
              />
              <input
                type="number" step="0.01" placeholder="Precio techo (Opcional)"
                style={{ ...inputStyle, color: "#ef4444", fontWeight: 700 }}
                value={formData.maxPrice || ""}
                onChange={(e) => setField("maxPrice", e.target.value)}
              />
              <input
                type="number" step="0.01" placeholder="Precio costo"
                style={{ ...inputStyle, opacity: 0.6, fontWeight: 700 }}
                value={formData.cost}
                onChange={(e) => setField("cost", e.target.value)}
                required
              />
              <select
                style={selectStyle}
                value={formData.supplierId}
                onChange={(e) => setField("supplierId", e.target.value)}
              >
                <option value="" style={{ backgroundColor: secondaryColor }}>Proveedor...</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id} style={{ backgroundColor: secondaryColor }}>{p.name}</option>
                ))}
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
                style={{ borderBottom: `1px solid ${overlayBorder}` }}
              >
                <span
                  className="text-[10px] font-black uppercase tracking-widest opacity-50"
                  style={{ color: textColor }}
                >
                  Variantes
                </span>
                <button
                  type="button"
                  disabled={!formData.subCategoryId}
                  onClick={addVariant}
                  className="text-[10px] font-bold uppercase transition-opacity"
                  style={{ 
                    color: formData.subCategoryId ? primaryColor : textColor, 
                    opacity: formData.subCategoryId ? 1 : 0.3,
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
              className="w-full py-4 font-black uppercase tracking-wider text-sm transition-all shadow-md cursor-pointer"
              style={{
                backgroundColor: loading ? overlayBorder : primaryColor,
                color: primaryTextColor,
                borderRadius: "16px",
                border: "none",
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(0.9)"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
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
      className="text-[10px] font-bold uppercase transition-colors cursor-pointer opacity-50 hover:opacity-100"
      style={{ color: textColor }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = primaryColor)}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = textColor)}
    >
      Editar
    </button>
  ) : (
    <button
      onClick={() => setIsOpen(true)}
      className="font-bold uppercase px-4 py-2 transition-all shadow-md cursor-pointer"
      style={{
        backgroundColor: primaryColor,
        color: primaryTextColor,
        borderRadius: "10px",
        fontSize: "13px",
        border: "none",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(0.9)")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.filter = "none")}
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