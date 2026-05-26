import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";

// Genera las rutas estáticas para cada categoría activa
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { name: true },
  });
  return categories.map((c) => ({
    categoria: c.name.toLowerCase(),
  }));
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
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const categoryName = decodeURIComponent(categoria);

  // Buscar categoría con sus subcategorías y conteo de productos
  const category = await prisma.category.findFirst({
    where: { name: categoryName, active: true },
    include: {
      subCategories: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          _count: { select: { garments: { where: { active: true } } } },
          garments: {
            where: { active: true },
            take: 1,
            include: { images: { orderBy: { order: "asc" }, take: 1 } },
          },
        },
      },
      _count: { select: { garments: { where: { active: true } } } },
    },
  });

  if (!category) notFound();

  // Productos sin subcategoría
  const ungroupedGarments = await prisma.garment.findMany({
    where: { categoryId: category.id, subCategoryId: null, active: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-white pt-24">

      {/* Header de categoría */}
      <div className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al inicio
          </Link>
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-cyan-400 mb-2 block">
              NewSurfBoard
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
              {category.name}
            </h1>
            <p className="text-neutral-500 mt-3 text-sm font-light">
              {category._count.garments} productos disponibles
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Subcategorías */}
        {category.subCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
              Explorá por subcategoría
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subCategories.map((sub, index) => {
                const coverImage = sub.garments[0]?.images[0]?.srcImage;
                return (
                  <Link
                    key={sub.id}
                    href={`/productos/${encodeURIComponent(category.name.toLowerCase())}/${encodeURIComponent(sub.name.toLowerCase())}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex items-center gap-5 p-5"
                  >
                    {/* Mini imagen o placeholder */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">
                        {sub.name}
                      </h3>
                      <p className="text-xs font-bold text-blue-500 mt-1.5">
                        {sub._count.garments} productos
                      </p>
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all flex-shrink-0"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Productos sin subcategoría */}
        {ungroupedGarments.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
              {category.subCategories.length > 0 ? "Otros productos" : "Todos los productos"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ungroupedGarments.map((g) => (
                <div
                  key={g.id}
                  className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-slate-200">
                    {g.images[0] ? (
                      <img
                        src={g.images[0].srcImage}
                        alt={g.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={28} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{g.name}</h3>
                    <p className="text-blue-600 font-black text-base mt-1">
                      ${parseFloat(String(g.price)).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {category.subCategories.length === 0 && ungroupedGarments.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Package size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No hay productos en esta categoría todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}