import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Package, Tag, Layers } from "lucide-react";
import ProductGrid from "@/components/catalogo/ProductGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; subcategoria: string }>;
}) {
  const { categoria, subcategoria } = await params;
  return {
    title: `${decodeURIComponent(subcategoria)} — ${decodeURIComponent(categoria)} — NewSurfBoard`,
  };
}

export default async function SubcategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string; subcategoria: string }>;
}) {
  const { categoria, subcategoria } = await params;
  const categoryName = decodeURIComponent(categoria);
  const subCategoryName = decodeURIComponent(subcategoria);

  // Buscar la subcategoría con sus productos completos
  const subCategory = await prisma.subCategory.findFirst({
    where: {
      name: subCategoryName,
      active: true,
      category: { name: categoryName, active: true },
    },
    include: {
      category: true,
      garments: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          images: { orderBy: { order: "asc" } },
          variants: {
            include: { size: true, color: true },
            orderBy: { size: { order: "asc" } },
          },
          subCategory: true,
        },
      },
    },
  });

  if (!subCategory) notFound();

  return (
    <div className="min-h-screen bg-white pt-24">

      {/* Header */}
      <div className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-600 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link
              href={`/productos/${encodeURIComponent(categoryName.toLowerCase())}`}
              className="hover:text-white transition-colors"
            >
              {subCategory.category.name}
            </Link>
            <span>/</span>
            <span className="text-neutral-400">{subCategory.name}</span>
          </div>

          <div>
            <span className="text-xs font-black tracking-widest uppercase text-cyan-400 mb-2 block">
              {subCategory.category.name}
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
              {subCategory.name}
            </h1>
            <p className="text-neutral-600 mt-2 text-xs font-bold uppercase tracking-widest">
              {subCategory.garments.length} productos
            </p>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {subCategory.garments.length > 0 ? (
          <ProductGrid garments={subCategory.garments} />
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Package size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No hay productos en esta subcategoría todavía.</p>
            <Link
              href={`/productos/${encodeURIComponent(categoryName.toLowerCase())}`}
              className="inline-flex items-center gap-2 mt-4 text-blue-500 hover:text-blue-600 text-sm font-bold transition-colors"
            >
              <ArrowLeft size={14} />
              Volver a {subCategory.category.name}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}