import { getGarments } from "@/actions/garments";
import { getCategories } from "@/actions/categories";
import CatalogoClient from "@/components/products/views/CatalogoClient";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ page?: string; categoria?: string; subcategoria?: string }>;
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const categoria = params.categoria;
  const subcategoria = params.subcategoria;

  let categoryId: string | undefined;
  if (categoria) {
    const decoded = decodeURIComponent(categoria).trim().toLowerCase();
    const categorias = await prisma.category.findMany();
    const match = categorias.find(
      (c) => c.name.trim().toLowerCase() === decoded
    );
    categoryId = match?.id;
  }

  let subCategoryId: string | undefined;
  if (subcategoria && categoryId) {
    const decodedSub = decodeURIComponent(subcategoria).trim().toLowerCase();
    const subCategories = await prisma.subCategory.findMany({
      where: { categoryId },
    });
    const matchSub = subCategories.find(
      (s) => s.name.trim().toLowerCase() === decodedSub
    );
    subCategoryId = matchSub?.id;
  }

  const result = await getGarments(page, 20, categoryId, undefined, subCategoryId);
  const categories = await getCategories();

  if (!result.success) {
    return <div className="p-8 text-center text-red-500">Error: {result.error}</div>;
  }

  return (
    <CatalogoClient
      garments={result.data}
      categories={categories}
      totalPages={result.totalPages}
      currentPage={page}
    />
  );
}