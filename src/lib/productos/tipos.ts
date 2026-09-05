export type OrdenProducto =
  | "recientes"
  | "antiguos"
  | "nombre-asc"
  | "nombre-desc"
  | "precio-asc"
  | "precio-desc"
  | "stock-asc"
  | "stock-desc";

export type EstadoProducto = "activo" | "oculto";

export type FiltroStock =
  | "todos"
  | "en-stock"
  | "bajo-stock"
  | "sin-stock";

export interface CategoriaResumen {
  id: string;
  nombre: string;
}

export interface SubcategoriaResumen {
  id: string;
  nombre: string;
}

export interface ProveedorResumen {
  id: string;
  nombre: string;
}

export interface ProductoAdminRow {
  id: string;
  nombre: string;
  precio: number;
  precioMaximo: number | null;
  activo: boolean;
  stockTotal: number;
  cantidadVariantes: number;
  imagenPrincipal: string | null;
  categoria: CategoriaResumen | null;
  subcategoria: SubcategoriaResumen | null;
  proveedor: ProveedorResumen | null;
  creadoEn: string;
}

export interface RespuestaProductosAdmin {
  success: boolean;
  filas?: ProductoAdminRow[];
  total?: number;
  totalPaginas?: number;
  error?: string;
}
