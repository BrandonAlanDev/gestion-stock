import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PaginaCategoriaClient from "@/components/categories/view/PaginaCategoriaClient";
import { obtenerCategoriasCatalogo } from "@/lib/services/categorias/obtener-categorias-catalogo";
import { obtenerPrendasPaginadas } from "@/lib/services/prendas/obtener-prendas-paginadas";
import { serializarDatos } from "@/lib/utilidades/serializar-datos";

export default async function PaginaCategoria({
  categoria,
  tenantId,
  searchParams,
}: {
  categoria: string;
  tenantId: string;
  searchParams?: Promise<{ page?: string; limit?: string; subcategory?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.min(100, Math.max(1, Math.trunc(Number(sp?.page)) || 1));
  const limit = Math.min(50, Math.max(1, Math.trunc(Number(sp?.limit)) || 12));
  const categorias = await obtenerCategoriasCatalogo(tenantId);
  const category = categorias.find((item) => item.name.toLocaleLowerCase("es-AR") === categoria.toLocaleLowerCase("es-AR"));
  if (!category) notFound();
  const subCategoryId = category.subCategories.find((item) => item.id === sp?.subcategory)?.id;

  const { garments, total } = await obtenerPrendasPaginadas(
    tenantId, currentPage, limit, category.id, undefined, subCategoryId
  );
  const obtenidoEn = Date.now();

  return (
    <div className="min-h-screen bg-[var(--color-fondo-sitio)] pt-20 sm:pt-24">
      <div className="relative border-b border-current/10 bg-[var(--color-fondo-sitio)]">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--texto-sobre-fondo)] opacity-70 transition-colors hover:opacity-100">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <div>
            <span className="mb-1 block text-sm font-medium text-[var(--color-primario)]">Categoría</span>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--texto-sobre-fondo)] sm:text-4xl">{category.name}</h1>
          </div>
        </div>
      </div>

      <PaginaCategoriaClient
        tenantId={tenantId}
        categories={categorias}
        category={category}
        categoriesObtenidoEn={obtenidoEn}
        initialGarments={{
          success: true,
          data: serializarDatos(garments),
          total,
          page: currentPage,
          totalPages: Math.ceil(total / limit),
          obtenidoEn,
        }}
        initialPage={currentPage}
        initialLimit={limit}
        initialSubcategory={subCategoryId}
        basePath={`/productos/${encodeURIComponent(categoria)}`}
      />
    </div>
  );
}
