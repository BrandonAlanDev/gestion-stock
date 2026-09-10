export interface OpcionProductoFormulario {
  name: string;
  values: string[];
}

export interface ParOpcionValor {
  opcion: string;
  valor: string;
}

export interface VarianteProductoFormulario {
  id?: string;
  opcionValores: ParOpcionValor[];
  stock: number;
  sku?: string | null;
  priceOverride?: number | null;
}

export interface VarianteProductoSerializada {
  id: string;
  stock: number;
  sku?: string | null;
  priceOverride?: number | null;
  opcionValores: ParOpcionValor[];
}

export interface DatosGuardarProducto {
  name: string;
  price: number;
  maxPrice: number | null;
  cost: number;
  description: string | null;
  categoryId: string;
  subCategoryId: string | null;
  supplierId: string | null;
  controlaStock: boolean;
  activo: boolean;
  etiquetas: string[];
  opciones: OpcionProductoFormulario[];
  variants: Array<{
    id?: string;
    opcionValores: ParOpcionValor[];
    stock: number;
    sku: string | null;
    priceOverride: number | null;
  }>;
  images: Array<{ url: string; publicId?: string | null; order: number }>;
}

