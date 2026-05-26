import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Package, Layers } from "lucide-react";
import CategoryContentClient from "@/components/catalogo/CategoryContentClient";

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

  // Traemos la categoría, sus subcategorías y TODOS los productos asociados activos
  const category = await prisma.category.findFirst({
    where: { name: categoryName, active: true },
    include: {
      subCategories: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
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
      _count: { select: { garments: { where: { active: true } } } },
    },
  });

  if (!category) notFound();

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Header - Limpio en Blanco y Cyan */}
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
              Catalogo Oficial
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-neutral-900 leading-none">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Enviamos toda la data al componente interactivo del cliente */}
      <CategoryContentClient 
        subCategories={category.subCategories} 
        garments={category.garments} 
      />
    </div>
  );
}