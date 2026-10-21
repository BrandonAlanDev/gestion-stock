import { Suspense } from "react";
import PaginaProductos from "@/components/admin/productos/pagina-productos";
import CargandoProductos from "./loading";
import { obtenerProductosAdmin } from "@/actions/productos/obtener-productos-admin";
import { getCategories } from "@/actions/categorias/obtener-categorias";
import { getProviders } from "@/actions/proveedores/obtener-proveedores";
import { leerFiltrosDesdeUrl } from "@/lib/productos/query-params";

type Parametros = Record<string, string | string[] | undefined>;

async function ContenidoProductosAdmin({ searchParams }: { searchParams: Promise<Parametros> }) {
  const parametros = await searchParams;
  const url = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    if (typeof valor === "string") url.set(clave, valor);
  }
  const filtros = leerFiltrosDesdeUrl(url);
  const [productos, categorias, proveedores] = await Promise.all([
    obtenerProductosAdmin({
      pagina: filtros.pagina,
      limite: 20,
      busqueda: filtros.busqueda || undefined,
      categoriaId: filtros.categoriaId || undefined,
      subcategoriaId: filtros.subcategoriaId || undefined,
      proveedorId: filtros.proveedorId || undefined,
      estado: filtros.estado || undefined,
      stock: filtros.stock || undefined,
      orden: filtros.orden,
    }),
    getCategories(),
    getProviders(),
  ]);
  return <PaginaProductos productosIniciales={productos.success ? productos : undefined} categoriasIniciales={categorias} proveedoresIniciales={proveedores} />;
}

export default function PaginaProductosAdmin({ searchParams }: { searchParams: Promise<Parametros> }) {
  return (
    <Suspense fallback={<CargandoProductos />}>
      <ContenidoProductosAdmin searchParams={searchParams} />
    </Suspense>
  );
}
