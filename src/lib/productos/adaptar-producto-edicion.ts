import type { ProductoEdicion } from "@/hooks/use-formulario-producto";

interface GarmentCrudo {
  id: string;
  name: string;
  price: number | string;
  maxPrice?: number | string | null;
  description?: string | null;
  categoryId?: string;
  subCategoryId?: string | null;
  etiquetas?: string[] | null;
  controlaStock?: boolean;
  active?: boolean;
  opciones?: Array<{ name: string; values?: Array<{ value: string }> }>;
  variants?: Array<{
    id: string;
    stock: number;
    sku?: string | null;
    priceOverride?: number | string | null;
    optionValues?: Array<{ optionValue: { value: string; option: { name: string } } }>;
  }>;
  images?: Array<{ srcImage: string; publicId?: string | null }>;
}

export function adaptarProductoEdicion(garment: GarmentCrudo): ProductoEdicion {
  return {
    id: garment.id,
    name: garment.name,
    price: garment.price,
    maxPrice: garment.maxPrice ?? null,
    description: garment.description,
    categoryId: garment.categoryId,
    subCategoryId: garment.subCategoryId,
    etiquetas: garment.etiquetas ?? [],
    controlaStock: garment.controlaStock ?? true,
    activo: garment.active ?? true,
    opciones: (garment.opciones ?? []).map((opcion) => ({
      name: opcion.name,
      values: (opcion.values ?? []).map((valor) => ({ value: valor.value })),
    })),
    variants: (garment.variants ?? []).map((variante) => ({
      id: variante.id,
      stock: variante.stock,
      sku: variante.sku ?? "",
      priceOverride: variante.priceOverride ?? null,
      opcionValores: (variante.optionValues ?? []).map((vinculo) => ({
        opcion: vinculo.optionValue.option.name,
        valor: vinculo.optionValue.value,
      })),
    })),
    images: (garment.images ?? []).map((imagen) => ({ srcImage: imagen.srcImage, publicId: imagen.publicId })),
  };
}
