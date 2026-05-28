"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { createGarment, updateGarment } from "@/actions/garments";
import { Button } from "@/components/ui/button";
import { X, Package, Edit3, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

/* ── Paleta ────────────────────────────────────────────────────────────
   #ffffff   blanco — fondos principales
   #f0fafa   cyan muy claro — fondos suaves
   #e0f5f5   cyan claro — inputs, variantes
   #b2dede   cyan borde
   #4ab8b8   cyan acento
   #0d5c63   verde marino — detalles, iconos
   #083d42   verde marino oscuro — títulos
   #0d2b2e   texto principal
   #4a7c80   texto secundario
──────────────────────────────────────────────────────────────────────── */

interface Props {
  categories: any[];
  sizes: any[];
  providers: any[];
  colors: any[];
  garment?: any;
}

interface Variant {
  id?: string;
  sizeId: string;
  colorId: string;
  stock: number;
  sku: string;
}

interface ImageType {
  url: string;
  publicId?: string;
}

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

function ColorDropdown({
  colors,
  value,
  onChange,
}: {
  colors: any[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = colors.find((c) => c.id === value);

  useEffect(() => {
    const clickOut = (e: any) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full cursor-pointer py-1 uppercase text-xs font-medium"
        style={{ color: selected ? "#0d2b2e" : "#4a7c80" }}
      >
        <span>{selected ? selected.name : "Color..."}</span>
        <ChevronDown
          size={12}
          style={{ color: "#4a7c80", transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "none" }}
        />
      </div>

      {open && (
        <div
          className="absolute top-full left-0 z-[110] w-48 mt-2 overflow-hidden shadow-xl"
          style={{ background: "#ffffff", border: "1px solid #b2dede", borderRadius: "12px" }}
        >
          <div className="max-h-48 overflow-y-auto">
            {colors.map((c) => (
              <div
                key={c.id}
                onClick={() => { onChange(c.id); setOpen(false); }}
                className="px-4 py-2 text-[11px] cursor-pointer transition-colors"
                style={{ color: "#0d2b2e" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "#e0f5f5";
                  (e.currentTarget as HTMLDivElement).style.color = "#0d5c63";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.color = "#0d2b2e";
                }}
              >
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductModal({ categories, sizes, providers, colors, garment }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isEdit = !!garment;

  useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({
    name: garment?.name || "",
    price: garment?.price?.toString() || "",
    cost: garment?.cost?.toString() || "",
    description: garment?.description || "",
    categoryId: garment?.categoryId || "",
    subCategoryId: garment?.subCategoryId || "",
    supplierId: garment?.supplierId || "",
    variants: garment?.variants?.map((v: any) => ({
      id: v.id,
      sizeId: v.sizeId || "CUSTOM",
      colorId: v.colorId || "",
      stock: v.stock,
      sku: v.sku || "",
      attributes: v.attributes || { customSize: "" },
    })) || [],
    images: garment?.images?.map((img: any) => ({
      url: img.srcImage,
      publicId: img.publicId || "",
    })) || [],
  });

  useEffect(() => {
    if (!garment) return;
    setFormData({
      name: garment.name || "",
      price: garment.price?.toString() || "",
      cost: garment.cost?.toString() || "",
      description: garment.description || "",
      categoryId: garment.categoryId || "",
      subCategoryId: garment.subCategoryId || "",
      supplierId: garment.supplierId || "",
      variants: garment.variants?.map((v: any) => ({
        id: v.id,
        sizeId: v.sizeId || "CUSTOM",
        colorId: v.colorId || "",
        stock: v.stock,
        sku: v.sku || "",
        attributes: v.attributes || { customSize: "" },
      })) || [],
      images: garment.images?.map((img: any) => ({
        url: img.srcImage,
        publicId: img.publicId || "",
      })) || [],
    });
  }, [garment]);

  const selectedCategoryData = useMemo(
    () => categories.find((c) => c.id === formData.categoryId),
    [formData.categoryId, categories]
  );

  const availableSubCategories = useMemo(
    () => selectedCategoryData?.subCategories || [],
    [selectedCategoryData]
  );

  const availableSizes = useMemo(() => {
    if (!formData.subCategoryId || !selectedCategoryData) return [];
    const selectedSub = selectedCategoryData.subCategories?.find((sc: any) => sc.id === formData.subCategoryId);
    if (!selectedSub) return [];
    if (selectedSub.sizeType?.sizes?.length > 0) return selectedSub.sizeType.sizes;
    const globalSizeType = sizes.find((st: any) => st.id === selectedSub.sizeTypeId);
    return globalSizeType?.sizes || [];
  }, [formData.subCategoryId, selectedCategoryData, sizes]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 4) { toast.error("Máximo 4 imágenes."); return; }
    try {
      setLoading(true);
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: data }
          );
          if (!res.ok) throw new Error("Error subiendo imagen");
          const json = await res.json();
          return { url: json.secure_url, publicId: json.public_id };
        })
      );
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
      toast.success("Imágenes subidas");
    } catch (error) {
      toast.error("Error al subir imágenes");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) =>
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const addVariant = () =>
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { sizeId: "", colorId: "", stock: 0, sku: "", attributes: { customSize: "" } }],
    }));

  const removeVariant = (index: number) =>
    setFormData((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

  const updateVariant = (index: number, field: keyof Variant | "attributes", value: any) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const updateVariantCustomSize = (index: number, customSizeValue: string) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], attributes: { ...updated[index].attributes, customSize: customSizeValue } };
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const imageUrls = formData.images.map((img: ImageType) => img.url);
      const payload = {
        ...formData,
        variants: formData.variants.map((v: any) => ({
          ...v,
          sizeId: v.sizeId === "CUSTOM" ? null : v.sizeId,
          attributes: v.sizeId === "CUSTOM" ? v.attributes : null,
        })),
        price: Number(formData.price),
        cost: Number(formData.cost),
        images: imageUrls,
      };
      const res = isEdit ? await updateGarment(garment.id, payload) : await createGarment(payload);
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Fila 1: Nombre, Categoría, Subcategoría */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Nombre"
                style={inputStyle}
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <select
                style={selectStyle}
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value, subCategoryId: "", variants: [] }))}
                required
              >
                <option value="">Categoría...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                style={{ ...selectStyle, opacity: !formData.categoryId ? 0.5 : 1 }}
                value={formData.subCategoryId}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  subCategoryId: e.target.value,
                  variants: e.target.value
                    ? [{ sizeId: "", colorId: "", stock: 0, sku: "", attributes: { customSize: "" } }]
                    : [],
                }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <input
                type="number" step="0.01" placeholder="Precio costo"
                style={{ ...inputStyle, color: "#4a7c80", fontWeight: 600 }}
                value={formData.cost}
                onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                required
              />
              <select
                style={selectStyle}
                value={formData.supplierId}
                onChange={(e) => setFormData((prev) => ({ ...prev, supplierId: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 items-center p-3"
                    style={{
                      background: "#f0fafa",
                      border: "1px solid #b2dede",
                      borderRadius: "16px",
                    }}
                  >
                    {/* Talle */}
                    <div className="col-span-3 flex flex-col gap-1">
                      <select
                        className="w-full text-xs font-medium outline-none"
                        style={{ background: "transparent", color: "#0d2b2e", border: "none" }}
                        value={v.sizeId}
                        onChange={(e) => updateVariant(i, "sizeId", e.target.value)}
                        required
                      >
                        <option value="" style={{ background: "#f0fafa", color: "#4a7c80" }}>Talle...</option>
                        {availableSizes.map((s: any) => (
                          <option key={s.id} value={s.id} style={{ background: "#fff", color: "#0d2b2e" }}>
                            {String(s.value)}
                          </option>
                        ))}
                        <option value="CUSTOM" style={{ background: "#e0f5f5", color: "#0d5c63", fontWeight: 700 }}>
                          Personalizado...
                        </option>
                      </select>
                      {v.sizeId === "CUSTOM" && (
                        <input
                          type="text"
                          placeholder="Medida (ej: 5'8 x 20 x 2)"
                          style={{
                            background: "#e0f5f5",
                            border: "1px solid #b2dede",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "10px",
                            color: "#0d2b2e",
                            outline: "none",
                            marginTop: "4px",
                          }}
                          value={v.attributes?.customSize || ""}
                          onChange={(e) => updateVariantCustomSize(i, e.target.value)}
                          required
                        />
                      )}
                    </div>

                    {/* Color */}
                    <div className="col-span-3 pl-3" style={{ borderLeft: "1px solid #b2dede" }}>
                      <ColorDropdown colors={colors} value={v.colorId} onChange={(id) => updateVariant(i, "colorId", id)} />
                    </div>

                    {/* Stock */}
                    <div className="col-span-2 pl-3" style={{ borderLeft: "1px solid #b2dede" }}>
                      <input
                        type="number"
                        placeholder="Stock"
                        className="w-full text-xs outline-none"
                        style={{ background: "transparent", color: "#0d2b2e", border: "none" }}
                        value={v.stock}
                        onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>

                    {/* SKU */}
                    <div className="col-span-3 pl-3" style={{ borderLeft: "1px solid #b2dede" }}>
                      <input
                        placeholder="SKU"
                        className="w-full text-[10px] outline-none uppercase font-mono"
                        style={{ background: "transparent", color: "#4a7c80", border: "none" }}
                        value={v.sku}
                        onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      />
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        style={{ color: "#b2dede" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#e05050")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#b2dede")}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Imágenes */}
            <div className="space-y-4">
              <div className="flex justify-between pb-2" style={{ borderBottom: "1px solid #b2dede" }}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#4a7c80" }}>
                  Imágenes (Máx. 4)
                </span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-3 outline-none"
                style={{
                  background: "#f0fafa",
                  border: "1px solid #b2dede",
                  borderRadius: "12px",
                  color: "#0d2b2e",
                  fontSize: "14px",
                }}
              />
              <div className="flex gap-4 flex-wrap">
                {formData.images.map((img: ImageType, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 overflow-hidden group"
                    style={{ border: "1px solid #b2dede", borderRadius: "12px" }}
                  >
                    <Image src={img.url} alt={`Preview ${idx}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "#e05050" }}
                    >
                      <X size={12} style={{ color: "#fff" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

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