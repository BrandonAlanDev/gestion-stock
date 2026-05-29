"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createGarment, updateGarment } from "@/actions/garments";

interface Variant {
  id?: string;
  sizeId: string;
  colorId: string;
  stock: number;
  sku: string;
  attributes?: any;
}

interface ImageType {
  url: string;
  publicId?: string;
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
    cost: "",
    description: "",
    categoryId: "",
    subCategoryId: "",
    supplierId: "",
    variants: [] as Variant[],
    images: [] as ImageType[],
  });

  const isEdit = !!garment;

  // Cargar datos si estamos editando
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
  const addImages = useCallback((newImages: ImageType[]) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  // Submit
  const handleSubmit = useCallback(async () => {
    const imageUrls = formData.images.map((img) => img.url);
    const payload = {
      ...formData,
      variants: formData.variants.map((v) => ({
        ...v,
        sizeId: v.sizeId === "CUSTOM" ? null : v.sizeId,
        attributes: v.sizeId === "CUSTOM" ? v.attributes : null,
      })),
      price: Number(formData.price),
      cost: Number(formData.cost),
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
    handleSubmit,
  };
}