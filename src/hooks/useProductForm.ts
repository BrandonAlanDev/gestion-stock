"use client";
import { toast } from "sonner";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createGarment, updateGarment } from "@/actions/garments";
import type { PendingImage } from "@/components/providers/products/forms/ImageUploader";
import { obtenerTallaPersonalizada } from "@/lib/utilidades/obtener-talla-personalizada";

interface Variant {
  id?: string;
  sizeId: string;
  colorId: string;
  stock: number;
  sku: string;
  attributes?: { customSize?: string };
}

interface VarianteGarment {
  id?: string;
  sizeId?: string | null;
  colorId?: string | null;
  stock?: number;
  sku?: string | null;
  attributes?: unknown;
}

interface ImagenGarment {
  srcImage: string;
  publicId?: string | null;
}

interface GarmentFormulario {
  id: string;
  name?: string;
  price?: number | string | { toString(): string };
  cost?: number | string | { toString(): string };
  maxPrice?: number | string | { toString(): string } | null;
  description?: string | null;
  categoryId?: string;
  subCategoryId?: string | null;
  supplierId?: string | null;
  variants?: VarianteGarment[];
  images?: ImagenGarment[];
}

interface TallaFormulario {
  id: string;
  value: string;
}

interface TipoTallaFormulario {
  id: string;
  sizes?: TallaFormulario[];
}

interface SubcategoriaFormulario {
  id: string;
  name: string;
  sizeTypeId?: string | null;
  sizeType?: TipoTallaFormulario | null;
}

interface CategoriaFormulario {
  id: string;
  name: string;
  subCategories?: SubcategoriaFormulario[];
}

interface UseProductFormProps {
  garment?: GarmentFormulario;
  categories: CategoriaFormulario[];
  sizes: TipoTallaFormulario[];
}

export function useProductForm({ garment, categories, sizes }: UseProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    maxPrice: "",
    cost: "",
    description: "",
    categoryId: "",
    subCategoryId: "",
    supplierId: "",
    variants: [] as Variant[],
    images: [] as PendingImage[],
  });

  const isEdit = !!garment;

  // Cargar datos si estamos editando
  useEffect(() => {
    if (!garment) return;
    setFormData({
      name: garment.name || "",
      price: garment.price?.toString() || "",
      cost: garment.cost?.toString() || "",
      maxPrice: garment.maxPrice?.toString() || "",
      description: garment.description || "",
      categoryId: garment.categoryId || "",
      subCategoryId: garment.subCategoryId || "",
      supplierId: garment.supplierId || "",
      variants: garment.variants?.map((v) => ({
        id: v.id,
        sizeId: v.sizeId || "CUSTOM",
        colorId: v.colorId || "",
        stock: v.stock ?? 0,
        sku: v.sku || "",
        attributes: { customSize: obtenerTallaPersonalizada(v.attributes) || "" },
      })) || [],
      images: garment.images?.map((img) => ({
        url: img.srcImage,
        publicId: img.publicId || "",
      })) || [],
    });
  }, [garment]);

  // Categoría seleccionada
  const selectedCategoryData = useMemo(
    () => categories.find((c) => c.id === formData.categoryId),
    [formData.categoryId, categories]
  );

  // Subcategorías disponibles
  const availableSubCategories = useMemo(
    () => selectedCategoryData?.subCategories || [],
    [selectedCategoryData]
  );

  // Talles disponibles según subcategoría
  const availableSizes = useMemo(() => {
    if (!formData.subCategoryId || !selectedCategoryData) return [];
    const selectedSub = selectedCategoryData.subCategories?.find(
      (sc) => sc.id === formData.subCategoryId
    );
    if (!selectedSub) return [];
    const tallesDelTipo = selectedSub.sizeType?.sizes;
    if (tallesDelTipo && tallesDelTipo.length > 0) return tallesDelTipo;
    const globalSizeType = sizes.find((st) => st.id === selectedSub.sizeTypeId);
    return globalSizeType?.sizes ?? [];
  }, [formData.subCategoryId, selectedCategoryData, sizes]);

  // Handlers genéricos
  const setField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId,
      subCategoryId: "",
      variants: [],
    }));
  }, []);

  const handleSubCategoryChange = useCallback((subCategoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      subCategoryId,
      variants: subCategoryId
        ? [{ sizeId: "", colorId: "", stock: 0, sku: "", attributes: { customSize: "" } }]
        : [],
    }));
  }, []);

  // Variantes
  const addVariant = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { sizeId: "", colorId: "", stock: 0, sku: "", attributes: { customSize: "" } },
      ],
    }));
  }, []);

  const removeVariant = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }, []);

  const updateVariant = useCallback((index: number, field: string, value: unknown) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  }, []);

  const updateVariantCustomSize = useCallback((index: number, customSize: string) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = {
        ...updated[index],
        attributes: { ...updated[index].attributes, customSize },
      };
      return { ...prev, variants: updated };
    });
  }, []);

  // Imágenes
  const addImages = useCallback((newImages: PendingImage[]) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData((prev) => {
      const img = prev.images[index];
      // Revocar objectURL si era nueva
      if (img.preview && !img.url && img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  }, []);

  const reorderImages = useCallback((sourceIndex: number, targetIndex: number) => {
    setFormData((prev) => {
      const copy = [...prev.images];
      const [moved] = copy.splice(sourceIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return { ...prev, images: copy };
    });
  }, []);

  const editarImagen = useCallback((index: number, nuevoPreview: string) => {
    setFormData((prev) => {
      const images = [...prev.images];
      images[index] = { ...images[index], preview: nuevoPreview, file: undefined };
      return { ...prev, images };
    });
  }, []);

  // Función para convertir File a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      price: "",
      maxPrice: "",
      cost: "",
      description: "",
      categoryId: "",
      subCategoryId: "",
      supplierId: "",
      variants: [],
      images: [],
    });
  }, []);

  // Submit 
  const handleSubmit = useCallback(async () => {
    const finalImages: string[] = [];

    for (const img of formData.images) {
      try {
        if (img.file) {
          const base64 = await fileToBase64(img.file);
          finalImages.push(base64);
          if (img.preview && !img.preview.startsWith("data:")) {
            URL.revokeObjectURL(img.preview);
          }
        } else if (img.preview && img.preview.startsWith("data:")) {
          finalImages.push(img.preview);
        } else if (img.url) {
          finalImages.push(img.url);
        }
      } catch (error) {
        console.error("Error al procesar imagen individual:", error);
        toast.error("Error al procesar una imagen. Se omitirá.");
      }
    }

    if (finalImages.length === 0 && formData.images.length > 0) {
      throw new Error("No se pudo subir ninguna imagen. Revisá los archivos e intentá de nuevo.");
    }

    // Construcción del objeto final con maxPrice corregido
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      cost: Number(formData.cost),
      maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null,
      description: formData.description,
      categoryId: formData.categoryId,
      subCategoryId: formData.subCategoryId || null,
      supplierId: formData.supplierId || null,
      variants: formData.variants.map((v) => ({
        ...v,
        sizeId: v.sizeId === "CUSTOM" ? null : v.sizeId,
        attributes: v.sizeId === "CUSTOM" ? v.attributes : null,
      })),
      images: finalImages,
    };

    if (isEdit) {
      return updateGarment(garment.id, payload);
    } else {
      return createGarment(payload);
    }
  }, [formData, garment, isEdit]);

  return {
    formData,
    isEdit,
    selectedCategoryData,
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
  };
}
