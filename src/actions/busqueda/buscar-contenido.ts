"use server";

import { conPrisma } from "@/lib/prisma";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { obtenerIndiceProductosPublicos } from "@/lib/services/prendas/obtener-indice-productos-publicos";
import { obtenerCategoriasCatalogo } from "@/lib/services/categorias/obtener-categorias-catalogo";
import { normalizarSlugCategoria } from "@/lib/categorias/slugs-categoria";
import type { ResultadoBusqueda } from "@/types/busqueda/resultado-busqueda";

const LIMITE_POR_TIPO = 8;
const LIMITE_RESULTADOS = 8;
const LONGITUD_MAXIMA_CONSULTA = 80;

export async function buscarContenido(consulta: string): Promise<ResultadoBusqueda[]> {
  const texto = typeof consulta === "string" ? consulta.trim().slice(0, LONGITUD_MAXIMA_CONSULTA) : "";
  if (texto.length < 2) return [];

  const tenant = await requiereTenantActivo();
  try {
    const [[prendas, categorias, subcategorias, paginas], categoriasCatalogo] = await Promise.all([
      conPrisma((prisma) => Promise.all([
        prisma.garment.findMany({
          where: { active: true, name: { contains: texto }, category: { active: true } },
          orderBy: { name: "asc" },
          take: LIMITE_POR_TIPO,
          select: {
            id: true,
            name: true,
            images: {
              where: {},
              orderBy: { order: "asc" },
              take: 1,
              select: { srcImage: true },
            },
          },
        }),
        prisma.category.findMany({
          where: { active: true, name: { contains: texto } },
          orderBy: { name: "asc" },
          take: LIMITE_POR_TIPO,
          select: { id: true, name: true },
        }),
        prisma.subCategory.findMany({
          where: { active: true, name: { contains: texto }, category: { active: true } },
          orderBy: { name: "asc" },
          take: LIMITE_POR_TIPO,
          select: { id: true, name: true, category: { select: { id: true, name: true } } },
        }),
        prisma.customPage.findMany({
          where: { isActive: true, title: { contains: texto } },
          orderBy: { title: "asc" },
          take: LIMITE_POR_TIPO,
          select: { id: true, title: true, slug: true },
        }),
      ])),
      obtenerCategoriasCatalogo(tenant.id),
    ]);

    const indice = await obtenerIndiceProductosPublicos(tenant.id);
    const categoriaPorId = new Map(categoriasCatalogo.map((categoria) => [categoria.id, categoria]));
    const grupos: ResultadoBusqueda[][] = [
      prendas.map((prenda) => ({
        id: prenda.id,
        type: "product",
        title: prenda.name,
        url: `/productos/${indice.porId[prenda.id]?.slug ?? prenda.id}`,
        imageUrl: prenda.images[0]?.srcImage ?? null,
      })),
      categorias.map((categoria) => ({
        id: categoria.id,
        type: "category",
        title: categoria.name,
        url: `/productos?categoria=${encodeURIComponent(categoriaPorId.get(categoria.id)?.slug ?? normalizarSlugCategoria(categoria.name))}`,
      })),
      subcategorias.map((subcategoria) => ({
        id: subcategoria.id,
        type: "subcategory",
        title: subcategoria.name,
        url: `/productos?categoria=${encodeURIComponent(categoriaPorId.get(subcategoria.category.id)?.slug ?? normalizarSlugCategoria(subcategoria.category.name))}&subcategoria=${encodeURIComponent(normalizarSlugCategoria(subcategoria.name))}`,
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
