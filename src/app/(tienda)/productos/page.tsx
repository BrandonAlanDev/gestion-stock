import CatalogoClient from "@/components/providers/products/views/CatalogoClient";
import { obtenerCategoriasCatalogo } from "@/lib/services/categorias/obtener-categorias-catalogo";
import { obtenerPrendasPaginadas } from "@/lib/services/prendas/obtener-prendas-paginadas";
import { serializarDatos as serializeData } from "@/lib/utilidades/serializar-datos";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { resolverElementoPorReferencia } from "@/lib/categorias/slugs-categoria";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; categoria?: string; subcategoria?: string }>;
}) {
  const tenant = await requiereTenantActivo();
  const sp = await searchParams;
  const currentPage = Math.min(100, Math.max(1, Math.trunc(Number(sp?.page)) || 1));
  const limit = 20;
  const categoria = sp?.categoria || undefined;
  const subcategoria = sp?.subcategoria || undefined;

  const categories = await obtenerCategoriasCatalogo(tenant.id);
  const categoriesObtenidoEn = Date.now();

  let categoryId: string | undefined;
  if (categoria) {
    categoryId = resolverElementoPorReferencia(categories, categoria)?.id;
  }

  let subCategoryId: string | undefined;
  if (subcategoria && categoryId) {
    const categoriaSeleccionada = categories.find((c) => c.id === categoryId);
    subCategoryId = resolverElementoPorReferencia(categoriaSeleccionada?.subCategories ?? [], subcategoria)?.id;
  }

  const { garments, total } = await obtenerPrendasPaginadas(
    tenant.id,
    currentPage,
    limit,
    categoryId,
    undefined,
    subCategoryId
  );

  const initialGarments = {
    success: true,
    data: serializeData(garments),
    total,
    page: currentPage,
    totalPages: Math.ceil(total / limit),
    obtenidoEn: Date.now(),
  };

  const initialCategories = serializeData(categories);

  return (
    <CatalogoClient
      tenantId={tenant.id}
      initialCategoria={categoria}
      initialSubcategoria={subcategoria}
      initialGarments={initialGarments}
      initialCategories={initialCategories}
      initialCategoriesObtenidoEn={categoriesObtenidoEn}
    />
  );
}
