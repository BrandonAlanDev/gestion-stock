export interface ImagenProductoDetalle {
  id: string;
  srcImage: string;
  alt?: string | null;
}

export interface VarianteProductoDetalle {
  id: string;
  stock: number;
  sku?: string | null;
  attributes?: Record<string, unknown> | null;
  priceOverride?: number | null;
  size?: { id: string; value: string } | null;
  color?: { id: string; name: string; hex: string | null } | null;
  optionValues?: Array<{ optionValue: { value: string; option: { name: string } } }>;
}

export interface OpcionProductoDetalle {
  id?: string;
  name: string;
  values?: Array<{ id?: string; value: string }>;
}

export interface ProductoDetalleSerializado {
  id: string;
  active: boolean;
  name: string;
  price: number;
  maxPrice: number | null;
  description?: string | null;
  etiquetas?: string[] | null;
  controlaStock?: boolean;
  category?: { name: string } | null;
  subCategory?: { name: string } | null;
  images: ImagenProductoDetalle[];
  variants: VarianteProductoDetalle[];
  opciones?: OpcionProductoDetalle[];
}
