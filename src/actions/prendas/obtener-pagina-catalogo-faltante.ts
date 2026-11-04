"use server";

import { conPrismaTenant } from "@/lib/prisma";
import { SELECCION_TARJETA_PRODUCTO_PUBLICO } from "@/lib/services/prendas/seleccion-producto-publico";
import { obtenerIndiceProductosPublicos } from "@/lib/services/prendas/obtener-indice-productos-publicos";
import { obtenerCategoriasCatalogo } from "@/lib/services/categorias/obtener-categorias-catalogo";
import { resolverElementoPorReferencia } from "@/lib/categorias/slugs-categoria";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { serializarDatos } from "@/lib/utilidades/serializar-datos";
import { idsTarjetasFaltantes, type VersionTarjetaCatalogo } from "@/lib/productos/versiones-catalogo";

export async function obtenerPaginaCatalogoFaltante(
  pagina: number,
  limite: number,
  categoria?: string,
  subcategoria?: string,
  idsConocidos: VersionTarjetaCatalogo[] = []
) {
  if (
    !Number.isInteger(pagina) || pagina < 1 || pagina > 100 ||
    !Number.isInteger(limite) || limite < 1 || limite > 50 ||
    (categoria !== undefined && (typeof categoria !== "string" || categoria.length > 120)) ||
    (subcategoria !== undefined && (typeof subcategoria !== "string" || subcategoria.length > 120)) ||
    !Array.isArray(idsConocidos) || idsConocidos.length > 400 ||
    !idsConocidos.every((producto) =>
      producto && typeof producto.id === "string" && producto.id.length > 0 && producto.id.length <= 100 &&
      typeof producto.updatedAt === "string" && producto.updatedAt.length <= 40 &&
      Number.isFinite(Date.parse(producto.updatedAt)) &&
      typeof producto.slug === "string" && producto.slug.length <= 200
    )
  ) return { error: "Filtros de catálogo inválidos" };

  const tenant = await requiereTenantActivo();
  const categorias = await obtenerCategoriasCatalogo(tenant.id);
  const categoriaEncontrada = resolverElementoPorReferencia(categorias, categoria);
  if (categoria && !categoriaEncontrada) return { error: "Categoría inexistente" };

  const subcategoriaEncontrada = categoriaEncontrada
    ? resolverElementoPorReferencia(categoriaEncontrada.subCategories, subcategoria)
    : undefined;
  if (subcategoria && !subcategoriaEncontrada) return { error: "Subcategoría inexistente" };

  const indice = await obtenerIndiceProductosPublicos(tenant.id);
  const where = {
    active: true,
    ...(categoriaEncontrada && { categoryId: categoriaEncontrada.id }),
    ...(subcategoriaEncontrada && { subCategoryId: subcategoriaEncontrada.id }),
  };

  const resultado = await conPrismaTenant(tenant.id, async (prisma) => {
      const [paginaIds, total] = await Promise.all([
        prisma.garment.findMany({
          where,
          select: { id: true, updatedAt: true },
          skip: (pagina - 1) * limite,
          take: limite,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        }),
        prisma.garment.count({ where }),
      ]);
      const ids = paginaIds.map((producto) => producto.id);
      const faltantes = idsTarjetasFaltantes(paginaIds.map((producto) => ({
        id: producto.id,
        updatedAt: producto.updatedAt.toISOString(),
        slug: indice.porId[producto.id]?.slug ?? producto.id,
      })), idsConocidos);
      const productos = faltantes.length
        ? await prisma.garment.findMany({
          where: { ...where, id: { in: faltantes } },
          select: SELECCION_TARJETA_PRODUCTO_PUBLICO,
        })
        : [];
      return { ids, productos, total };
  });

  return {
    success: true,
    ids: resultado.ids,
    data: serializarDatos(resultado.productos.map((producto) => ({
      ...producto,
      slug: indice.porId[producto.id]?.slug ?? producto.id,
    }))),
    total: resultado.total,
    page: pagina,
    totalPages: Math.ceil(resultado.total / limite),
  };
}
