import { getGarments, getCategories } from "@/actions/garments";
import CatalogoClient from "@/components/products/views/CatalogoClient";
import { prisma } from "@/lib/prisma"; // ✅ importar prisma

interface Props {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const categoria = params.categoria;

  let categoryId: string | undefined;
  if (categoria) {
    const cat = await prisma.category.findFirst({
      where: { name: decodeURIComponent(categoria) },
    });
    categoryId = cat?.id;
  }

  // Llamamos a getGarments con paginación
  const result = await getGarments(page, 20, categoryId);
  const categories = await getCategories(); // ✅ ahora cacheada

  if (!result.success) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {result.error}
      </div>
    );
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