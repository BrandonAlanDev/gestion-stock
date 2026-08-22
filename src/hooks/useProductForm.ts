"use client";
import { toast } from "sonner";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createGarment, updateGarment } from "@/actions/garments";
import { uploadProductImage } from "@/actions/upload-product-image";
import type { PendingImage } from "@/components/providers/products/forms/ImageUploader";

interface Variant {
  id?: string;
  sizeId: string;
  colorId: string;
  stock: number;
  sku: string;
  attributes?: any;
}

interface UseProductFormProps {
  garment?: any;
  categories: any[];
  sizes: any[];
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
      (sc: any) => sc.id === formData.subCategoryId
    );
    if (!selectedSub) return [];
    if (selectedSub.sizeType?.sizes?.length > 0) return selectedSub.sizeType.sizes;
    const globalSizeType = sizes.find((st: any) => st.id === selectedSub.sizeTypeId);
    return globalSizeType?.sizes || [];
  }, [formData.subCategoryId, selectedCategoryData, sizes]);

  // Handlers genéricos
  const setField = useCallback((field: string, value: any) => {
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

  const updateVariant = useCallback((index: number, field: string, value: any) => {
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
      if (img.preview && !img.url) {
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
    const finalImages: { url: string; publicId?: string }[] = [];

    for (const img of formData.images) {
      try {
        if (img.file) {
          const base64 = await fileToBase64(img.file);
          const uploaded = await uploadProductImage(base64);
          finalImages.push({ url: uploaded.url, publicId: uploaded.publicId });
          if (img.preview) URL.revokeObjectURL(img.preview);
        } else if (img.url) {
          finalImages.push({ url: img.url, publicId: img.publicId });
        }
      } catch (error) {
        console.error("Error al subir imagen individual:", error);
        toast.error("Error al subir una imagen. Se omitirá.");
      }
    }

    if (finalImages.length === 0 && formData.images.length > 0) {
      throw new Error("No se pudo subir ninguna imagen. Revisá los archivos e intentá de nuevo.");
    }

    const imageUrls = finalImages.map(img => img.url);
    
    // Construcción del objeto final con maxPrice corregido
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      cost: Number(formData.cost),
      maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null, // 👈 Solución aquí
      description: formData.description,
      categoryId: formData.categoryId,
      subCategoryId: formData.subCategoryId || null,
      supplierId: formData.supplierId || null,
      variants: formData.variants.map((v) => ({
        ...v,
        sizeId: v.sizeId === "CUSTOM" ? null : v.sizeId,
        attributes: v.sizeId === "CUSTOM" ? v.attributes : null,
      })),
      images: imageUrls,
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
    handleSubmit,
    resetForm,
  };
}