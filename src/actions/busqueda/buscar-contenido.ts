"use server";

import prisma from "@/lib/prisma";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import type { ResultadoBusqueda } from "@/types/busqueda/resultado-busqueda";

const LIMITE_POR_TIPO = 8;
const LIMITE_RESULTADOS = 8;
const LONGITUD_MAXIMA_CONSULTA = 80;

export async function buscarContenido(consulta: string): Promise<ResultadoBusqueda[]> {
  const texto = typeof consulta === "string" ? consulta.trim().slice(0, LONGITUD_MAXIMA_CONSULTA) : "";
  if (texto.length < 2) return [];

  const { id: tenantId } = await requiereTenantActivo();
  try {
    const [prendas, categorias, subcategorias, paginas] = await Promise.all([
      prisma.garment.findMany({
        where: { tenantId, active: true, name: { contains: texto }, category: { tenantId, active: true } },
        orderBy: { name: "asc" },
        take: LIMITE_POR_TIPO,
        select: {
          id: true,
          name: true,
          images: {
            where: { tenantId },
            orderBy: { order: "asc" },
            take: 1,
            select: { srcImage: true },
          },
        },
      }),
      prisma.category.findMany({
        where: { tenantId, active: true, name: { contains: texto } },
        orderBy: { name: "asc" },
        take: LIMITE_POR_TIPO,
        select: { id: true, name: true },
      }),
      prisma.subCategory.findMany({
        where: { tenantId, active: true, name: { contains: texto }, category: { tenantId, active: true } },
        orderBy: { name: "asc" },
        take: LIMITE_POR_TIPO,
        select: { id: true, name: true, category: { select: { name: true } } },
      }),
      prisma.customPage.findMany({
        where: { tenantId, isActive: true, title: { contains: texto } },
        orderBy: { title: "asc" },
        take: LIMITE_POR_TIPO,
        select: { id: true, title: true, slug: true },
      }),
    ]);

    const grupos: ResultadoBusqueda[][] = [
      prendas.map((prenda) => ({
        id: prenda.id,
        type: "product",
        title: prenda.name,
        url: `/productos/item/${prenda.id}`,
        imageUrl: prenda.images[0]?.srcImage ?? null,
      })),
      categorias.map((categoria) => ({
        id: categoria.id,
        type: "category",
        title: categoria.name,
        url: `/productos?categoria=${encodeURIComponent(categoria.name)}`,
      })),
      subcategorias.map((subcategoria) => ({
        id: subcategoria.id,
        type: "subcategory",
        title: subcategoria.name,
        url: `/productos?categoria=${encodeURIComponent(subcategoria.category.name)}&subcategoria=${encodeURIComponent(subcategoria.name)}`,
      })),
      paginas.map((pagina) => ({
        id: pagina.id,
        type: "page",
        title: pagina.title,
        url: `/page?title=${encodeURIComponent(pagina.slug)}`,
      })),
    ];

    const resultados: ResultadoBusqueda[] = [];
    for (let posicion = 0; posicion < LIMITE_POR_TIPO && resultados.length < LIMITE_RESULTADOS; posicion++) {
      for (const grupo of grupos) {
        if (grupo[posicion]) resultados.push(grupo[posicion]);
        if (resultados.length === LIMITE_RESULTADOS) break;
      }
    }
    return resultados;
  } catch (error) {
    console.error("Error al buscar contenido de la tienda:", error);
    return [];
  }
}
