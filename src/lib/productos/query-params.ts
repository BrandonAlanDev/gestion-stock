import type {
  EstadoProducto,
  FiltroStock,
  OrdenProducto,
} from "@/lib/productos/tipos";

export const LIMITE_DEFECTO = 20;

export const ORDEN_PREDETERMINADO: OrdenProducto = "recientes";

export interface FiltrosProductos {
  pagina: number;
  busqueda: string;
  categoriaId: string;
  subcategoriaId: string;
  proveedorId: string;
  estado: EstadoProducto | "";
  stock: FiltroStock | "";
  orden: OrdenProducto;
}

const VALORES_ESTADO: readonly string[] = ["activo", "oculto"];
const VALORES_STOCK: readonly string[] = ["todos", "en-stock", "bajo-stock", "sin-stock"];
const VALORES_ORDEN: readonly OrdenProducto[] = [
  "recientes",
  "antiguos",
  "nombre-asc",
  "nombre-desc",
  "precio-asc",
  "precio-desc",
  "stock-asc",
  "stock-desc",
];

interface ParametrosConsulta {
  get(clave: string): string | null;
}

export function leerFiltrosDesdeUrl(searchParams: ParametrosConsulta): FiltrosProductos {
  const pagina = Math.max(1, Number(searchParams.get("pagina")) || 1);
  const estadoRaw = searchParams.get("estado") ?? "";
  const stockRaw = searchParams.get("stock") ?? "";
  const ordenRaw = searchParams.get("orden") ?? "";

  return {
    pagina,
    busqueda: searchParams.get("busqueda") ?? "",
    categoriaId: searchParams.get("categoria") ?? "",
    subcategoriaId: searchParams.get("subcategoria") ?? "",
    proveedorId: searchParams.get("proveedor") ?? "",
    estado: VALORES_ESTADO.includes(estadoRaw) ? (estadoRaw as EstadoProducto) : "",
    stock: VALORES_STOCK.includes(stockRaw) && stockRaw !== "todos" ? (stockRaw as FiltroStock) : "",
    orden: VALORES_ORDEN.includes(ordenRaw as OrdenProducto)
      ? (ordenRaw as OrdenProducto)
      : ORDEN_PREDETERMINADO,
  };
}
