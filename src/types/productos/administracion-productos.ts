export interface TallaAdministracion {
  id: string;
  value: string;
}

export interface TipoTallaAdministracion {
  id: string;
  name?: string;
  sizes?: TallaAdministracion[];
}

export interface SubcategoriaAdministracion {
  id: string;
  name: string;
  sizeTypeId?: string | null;
  sizeType?: TipoTallaAdministracion | null;
}

export interface CategoriaAdministracion {
  id: string;
  name: string;
  subCategories?: SubcategoriaAdministracion[];
}

export interface ProveedorAdministracion {
  id: string;
  name: string;
  details?: string | null;
  contacts?: Array<{ id: string; type: string; contact: string }>;
}

export interface ColorAdministracion {
  id: string;
  name: string;
  hex?: string | null;
}

export interface VarianteAdministracion {
  id?: string;
  sizeId?: string | null;
  colorId?: string | null;
  stock?: number;
  sku?: string | null;
  attributes?: unknown;
  size?: { value?: string | null } | null;
  color?: ColorAdministracion | null;
}

export interface ProductoAdministracion {
  id: string;
  name?: string;
  price?: string | number | { toString(): string };
  cost?: string | number | { toString(): string };
  maxPrice?: string | number | { toString(): string } | null;
  description?: string | null;
  categoryId?: string;
  subCategoryId?: string | null;
  supplierId?: string | null;
  category?: { name: string } | null;
  supplier?: ProveedorAdministracion | null;
  variants?: VarianteAdministracion[];
  images?: Array<{ srcImage: string; publicId?: string | null }>;
}
