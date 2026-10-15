import { ORDEN_PREDETERMINADO } from "@/lib/productos/query-params";
import type { FiltrosProductos } from "@/lib/productos/query-params";

export function serializarFiltros(filtros: FiltrosProductos): URLSearchParams {
  const params = new URLSearchParams();
  if (filtros.pagina > 1) params.set("pagina", String(filtros.pagina));
  if (filtros.busqueda) params.set("busqueda", filtros.busqueda);
  if (filtros.categoriaId) params.set("categoria", filtros.categoriaId);
  if (filtros.subcategoriaId) params.set("subcategoria", filtros.subcategoriaId);
  if (filtros.proveedorId) params.set("proveedor", filtros.proveedorId);
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.stock && filtros.stock !== "todos") params.set("stock", filtros.stock);
  if (filtros.orden !== ORDEN_PREDETERMINADO) params.set("orden", filtros.orden);
  return params;
}
