import CatalogoClient from "@/components/providers/products/views/CatalogoClient";
import { getCachedCategories, getCachedProducts } from "@/lib/cache";
import { serializeData } from "@/lib/utils";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

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

  const categories = await getCachedCategories(tenant.id);

  let categoryId: string | undefined;
  if (categoria) {
    const decoded = decodeURIComponent(categoria).trim().toLowerCase();
    categoryId = categories.find(
      (c) => c.id === decoded || c.name.trim().toLowerCase() === decoded
    )?.id;
  }

  let subCategoryId: string | undefined;
  if (subcategoria && categoryId) {
    const decoded = decodeURIComponent(subcategoria).trim().toLowerCase();
    subCategoryId = categories
      .find((c) => c.id === categoryId)
      ?.subCategories.find(
        (s) => s.id === decoded || s.name.trim().toLowerCase() === decoded
      )?.id;
  }

  const { garments, total } = await getCachedProducts(
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
  };

  const initialCategories = serializeData(categories);

  return (
    <CatalogoClient
      initialGarments={initialGarments}
      initialCategories={initialCategories}
    />
  );
}
