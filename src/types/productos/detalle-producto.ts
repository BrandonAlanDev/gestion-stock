export interface ImagenProductoDetalle {
  id: string;
  srcImage: string;
  alt?: string | null;
}

export interface VarianteProductoDetalle {
  id: string;
  stock: number;
  attributes?: Record<string, unknown> | null;
  size?: { id: string; value: string } | null;
  color?: { id: string; name: string; hex: string | null } | null;
}

export interface ProductoDetalleSerializado {
  id: string;
  active: boolean;
  name: string;
  price: number;
  maxPrice: number | null;
  description?: string | null;
  category?: { name: string } | null;
  subCategory?: { name: string } | null;
  images: ImagenProductoDetalle[];
  variants: VarianteProductoDetalle[];
}
