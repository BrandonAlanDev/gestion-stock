import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryContentClient from "@/components/categories/view/CategoryContentClient";
import Pagination from "@/components/ui/pagination";
import * as categoryService from "@/lib/services/category-service";
import * as garmentService from "@/lib/services/garment-service";

export async function generateStaticParams() {
  const categories = await categoryService.getCategoriesFull();
  return categories.map((c) => ({ categoria: c.name.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const name = decodeURIComponent(categoria);
  return {
    title: `${name.charAt(0).toUpperCase() + name.slice(1)} — NewSurfBoard`,
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams?: Promise<{ page?: string; limit?: string; subcategory?: string }>;
}) {
  const { categoria } = await params;
  const sp = await searchParams;
  const currentPage = Number(sp?.page) || 1;
  const limit = Number(sp?.limit) || 12;
  const subCategoryId = sp?.subcategory || undefined;

  const categoryName = decodeURIComponent(categoria);

  // 1. Obtener categoría (sin productos)
  const category = await categoryService.getCategoryByName(categoryName);
  if (!category) notFound();

  // 2. Productos paginados y filtrados por subcategoría (si corresponde)
  const { garments, total } = await garmentService.getGarmentsPaginated(
    currentPage,
    limit,
    category.id,
    undefined, // search — no se usa en la página pública
    subCategoryId
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Header */}
      <div className="bg-neutral-50 border-b border-neutral-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-cyan-500 text-xs font-bold uppercase tracking-widest mb-6 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-cyan-500 mb-1 block">
              Catálogo Oficial
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-neutral-900 leading-none">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Sidebar + Grid */}
      <CategoryContentClient
        subCategories={category.subCategories}
        garments={garments}
        selectedSubId={subCategoryId || "all"}
        basePath={`/productos/${categoria}`}
      />

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/productos/${categoria}`}
        searchParams={{ subcategory: subCategoryId }}
      />
    </div>
  );
}