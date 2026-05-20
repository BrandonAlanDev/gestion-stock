"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { createGarment, updateGarment } from "@/actions/garments";
import { Button } from "@/components/ui/button";
import { X, Package, Edit3, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

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
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", clickOut);

    return () => {
      document.removeEventListener("mousedown", clickOut);
    };
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-transparent text-xs text-white cursor-pointer py-1 uppercase font-medium"
      >
        <span className={selected ? "text-white" : "text-neutral-500"}>
          {selected ? selected.name : "Color..."}
        </span>

        <ChevronDown
          size={12}
          className={`text-neutral-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 z-[110] w-48 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-[192px] overflow-y-auto custom-scrollbar">
            {colors.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className="px-4 py-2 text-[11px] text-white hover:bg-amber-500 hover:text-black cursor-pointer transition-colors"
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

export default function ProductModal({
  categories,
  sizes,
  providers,
  colors,
  garment,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isEdit = !!garment;

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: garment?.name || "",
    price: garment?.price?.toString() || "",
    cost: garment?.cost?.toString() || "",
    description: garment?.description || "",
    categoryId: garment?.categoryId || "",
    subCategoryId: garment?.subCategoryId || "",
    supplierId: garment?.supplierId || "",

    variants:
      garment?.variants?.map((v: any) => ({
        id: v.id,
        sizeId: v.sizeId,
        colorId: v.colorId || "",
        stock: v.stock,
        sku: v.sku || "",
      })) || [],

    images:
      garment?.images?.map((img: any) => ({
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

      variants:
        garment.variants?.map((v: any) => ({
          id: v.id,
          sizeId: v.sizeId,
          colorId: v.colorId || "",
          stock: v.stock,
          sku: v.sku || "",
        })) || [],

      images:
        garment.images?.map((img: any) => ({
          url: img.srcImage,
          publicId: img.publicId || "",
        })) || [],
    });
  }, [garment]);

  const selectedCategoryData = useMemo(() => {
    return categories.find((c) => c.id === formData.categoryId);
  }, [formData.categoryId, categories]);

  const availableSubCategories = useMemo(() => {
    if (!selectedCategoryData) return [];

    return selectedCategoryData.subCategories || [];
  }, [selectedCategoryData]);

  const availableSizes = useMemo(() => {
    if (!formData.subCategoryId || !selectedCategoryData) return [];

    const selectedSubCategory =
      selectedCategoryData.subCategories?.find(
        (sc: any) => sc.id === formData.subCategoryId
      );

    if (!selectedSubCategory) return [];

    if (selectedSubCategory.sizeType?.sizes) {
      return selectedSubCategory.sizeType.sizes;
    }

    if (selectedSubCategory.sizeTypeId) {
      return (
        sizes.find(
          (st: any) => st.id === selectedSubCategory.sizeTypeId
        )?.sizes || []
      );
    }

    return [];
  }, [formData.subCategoryId, selectedCategoryData, sizes]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (formData.images.length + files.length > 4) {
      toast.error("Máximo 4 imágenes.");
      return;
    }

    try {
      setLoading(true);

      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();

          data.append("file", file);

          data.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
          );

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${
              process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
            }/image/upload`,
            {
              method: "POST",
              body: data,
            }
          );

          if (!res.ok) {
            throw new Error("Error subiendo imagen");
          }

          const json = await res.json();

          return {
            url: json.secure_url,
            publicId: json.public_id,
          };
        })
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      toast.success("Imágenes subidas");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir imágenes");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          sizeId: "",
          colorId: "",
          stock: 0,
          sku: "",
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: any
  ) => {
    const updated = [...formData.variants];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      variants: updated,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...formData,
        price: Number(formData.price),
        cost: Number(formData.cost),
      };

      const res = isEdit
        ? await updateGarment(garment.id, payload)
        : await createGarment(payload);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        isEdit
          ? "Producto actualizado"
          : "Producto creado"
      );

      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modal =
    isOpen &&
    createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto text-white">
        <div className="bg-neutral-950 border border-neutral-800 w-full max-w-4xl my-auto rounded-3xl shadow-2xl relative">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center sticky top-0 bg-neutral-950 z-10 rounded-t-3xl">
            <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
              {isEdit ? (
                <Edit3 size={20} className="text-amber-500" />
              ) : (
                <Package size={20} className="text-amber-500" />
              )}

              {isEdit
                ? "Editar Producto"
                : "Nuevo Producto"}
            </h2>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            {/* Nombre / Categoria / Subcategoria */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Nombre"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />

              <select
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                    subCategoryId: "",
                    variants: [],
                  }))
                }
                required
              >
                <option value="">Categoría...</option>

                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none disabled:opacity-40"
                value={formData.subCategoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subCategoryId: e.target.value,
                    variants: [],
                  }))
                }
                disabled={!formData.categoryId}
                required
              >
                <option value="">Subcategoría...</option>

                {availableSubCategories.map((sc: any) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="Venta"
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-emerald-500 outline-none"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                required
              />

              <input
                type="number"
                step="0.01"
                placeholder="Costo"
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-amber-500 outline-none"
                value={formData.cost}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cost: e.target.value,
                  }))
                }
                required
              />

              <select
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none"
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    supplierId: e.target.value,
                  }))
                }
              >
                <option value="">Proveedor...</option>

                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripcion */}
            <textarea
              placeholder="Descripción..."
              className="w-full h-24 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            {/* Variantes */}
            <div className="space-y-4">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                  Variantes
                </span>

                <button
                  type="button"
                  disabled={!formData.subCategoryId}
                  onClick={addVariant}
                  className="text-amber-500 text-[10px] font-bold uppercase disabled:opacity-30"
                >
                  + Agregar Variante
                </button>
              </div>

              <div className="space-y-3">
                {formData.variants.map((v, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800/50 items-center"
                  >
                    {/* Talle */}
                    <div className="col-span-3">
                      <select
                        className="w-full bg-transparent text-xs text-white outline-none font-medium"
                        value={v.sizeId}
                        onChange={(e) =>
                          updateVariant(
                            i,
                            "sizeId",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">Talle...</option>

                        {availableSizes.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color */}
                    <div className="col-span-3 border-l border-neutral-800 pl-3">
                      <ColorDropdown
                        colors={colors}
                        value={v.colorId}
                        onChange={(id) =>
                          updateVariant(i, "colorId", id)
                        }
                      />
                    </div>

                    {/* Stock */}
                    <div className="col-span-2 border-l border-neutral-800 pl-3">
                      <input
                        type="number"
                        placeholder="Stock"
                        className="w-full bg-transparent text-xs text-white outline-none"
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(
                            i,
                            "stock",
                            parseInt(e.target.value) || 0
                          )
                        }
                        required
                      />
                    </div>

                    {/* SKU */}
                    <div className="col-span-3 border-l border-neutral-800 pl-3">
                      <input
                        placeholder="SKU"
                        className="w-full bg-transparent text-[10px] text-amber-500 outline-none uppercase"
                        value={v.sku}
                        onChange={(e) =>
                          updateVariant(
                            i,
                            "sku",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Delete */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="text-neutral-700 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Imagenes */}
            <div className="space-y-4">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                  Imágenes (Máx. 4)
                </span>
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white outline-none
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-full
                file:border-0
                file:text-sm
                file:font-semibold
                file:bg-amber-500
                file:text-black
                hover:file:bg-amber-600"
              />

              <div className="flex gap-4 flex-wrap">
                {formData.images.map((img: ImageType, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 border border-neutral-800 rounded-xl overflow-hidden group"
                  >
                    <Image
                      src={img.url}
                      alt={`Preview ${idx}`}
                      fill
                      className="object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X
                        size={12}
                        className="text-white"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="amarillo"
              className="w-full py-6 font-black uppercase rounded-2xl"
            >
              {loading
                ? "Procesando..."
                : isEdit
                ? "Guardar Cambios"
                : "Crear Producto"}
            </Button>
          </form>
        </div>
      </div>,
      document.body
    );

  const trigger = isEdit ? (
    <button
      onClick={() => setIsOpen(true)}
      className="text-[10px] font-bold text-neutral-600 hover:text-white uppercase"
    >
      Editar
    </button>
  ) : (
    <Button
      variant="amarillo"
      onClick={() => setIsOpen(true)}
      className="font-bold uppercase rounded-xl"
    >
      + Nuevo Producto
    </Button>
  );

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}