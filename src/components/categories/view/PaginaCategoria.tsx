import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryContentClient from "@/components/categories/view/CategoryContentClient";
import Pagination from "@/components/ui/pagination";
import { obtenerCategoriaPorNombre } from "@/lib/services/categorias/obtener-categoria-por-nombre";
import { obtenerPrendasPaginadas } from "@/lib/services/prendas/obtener-prendas-paginadas";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export default async function PaginaCategoria({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams?: Promise<{ page?: string; limit?: string; subcategory?: string }>;
}) {
  const { categoria } = await params;
  const tenant = await requiereTenantActivo();
  const sp = await searchParams;
  const currentPage = Math.min(100, Math.max(1, Math.trunc(Number(sp?.page)) || 1));
  const limit = Math.min(50, Math.max(1, Math.trunc(Number(sp?.limit)) || 12));
  const subCategoryId = sp?.subcategory || undefined;

  const categoryName = decodeURIComponent(categoria);

  // 1. Obtener categoría (sin productos)
  const category = await obtenerCategoriaPorNombre(tenant.id, categoryName);
  if (!category) notFound();

  // 2. Productos paginados y filtrados por subcategoría (si corresponde)
  const { garments, total } = await obtenerPrendasPaginadas(
    tenant.id,
    currentPage,
    limit,
    category.id,
    undefined, // search — no se usa en la página pública
    subCategoryId
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[var(--color-fondo-sitio)] pt-20 sm:pt-24">
      {/* Header */}
      <div className="relative border-b border-current/10 bg-[var(--color-fondo-sitio)]">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--texto-sobre-fondo)] opacity-70 transition-colors hover:opacity-100"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <div>
            <span className="mb-1 block text-sm font-medium text-[var(--color-primario)]">
              Categoría
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--texto-sobre-fondo)] sm:text-4xl">
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
