import { notFound, redirect } from "next/navigation";
import PaginaCategoria from "@/components/categories/view/PaginaCategoria";
import DetalleProductoClient from "@/components/tienda/producto/DetalleProductoClient";
import { generateMetadata as generarMetadataCategoria } from "@/lib/categorias/generar-metadata-categoria";
import { obtenerDetalleProductoCacheado } from "@/lib/services/prendas/obtener-detalle-producto-cacheado";
import { obtenerIndiceProductosPublicos } from "@/lib/services/prendas/obtener-indice-productos-publicos";
import { resolverIdProductoPorSegmento } from "@/lib/productos/slugs-producto";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { normalizarSlugCategoria } from "@/lib/categorias/slugs-categoria";

interface Props {
  params: Promise<{ categoria: string }>;
  searchParams?: Promise<{ page?: string; limit?: string; subcategory?: string }>;
}

function buscarCategoria(segmento: string, categorias: string[]) {
  const segmentoNormalizado = segmento.toLocaleLowerCase("es-AR");
  return categorias.find((nombre) =>
    nombre.toLocaleLowerCase("es-AR") === segmentoNormalizado ||
    normalizarSlugCategoria(nombre) === segmentoNormalizado
  );
}

export async function generateMetadata({ params }: Props) {
  const { categoria: segmento } = await params;
  const tenant = await requiereTenantActivo();
  const indice = await obtenerIndiceProductosPublicos(tenant.id);
  const categoria = buscarCategoria(segmento, indice.categorias);
  if (categoria) return generarMetadataCategoria({ params: Promise.resolve({ categoria }) });

  const id = resolverIdProductoPorSegmento(segmento, indice);
  return { title: id ? indice.porId[id].name : "Producto no disponible" };
}

export default async function ProductoOCategoriaPage({ params, searchParams }: Props) {
  const { categoria: segmento } = await params;
  const tenant = await requiereTenantActivo();
  const indice = await obtenerIndiceProductosPublicos(tenant.id);
  const categoria = buscarCategoria(segmento, indice.categorias);
  if (categoria) return <PaginaCategoria categoria={categoria} tenantId={tenant.id} searchParams={searchParams} />;

  const id = resolverIdProductoPorSegmento(segmento, indice);
  if (!id) notFound();
  const slug = indice.porId[id].slug;
  if (segmento !== slug) redirect(`/productos/${slug}`);

  const producto = await obtenerDetalleProductoCacheado(tenant.id, id);
  if (!producto) notFound();
  return <DetalleProductoClient key={producto.id} producto={producto} />;
}
