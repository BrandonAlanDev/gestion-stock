"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerProductosAdmin as consultarProductosAdmin } from "@/lib/services/garment-admin-service";
import type { RespuestaProductosAdmin } from "@/lib/productos/tipos";

const esquemaConsulta = z.object({
  pagina: z.coerce.number().int().min(1).max(100).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(20),
  busqueda: z.string().trim().optional(),
  categoriaId: z.string().optional(),
  subcategoriaId: z.string().optional(),
  proveedorId: z.string().optional(),
  estado: z.enum(["activo", "oculto"]).optional(),
  stock: z.enum(["todos", "en-stock", "bajo-stock", "sin-stock"]).optional(),
  orden: z
    .enum([
      "recientes",
      "antiguos",
      "nombre-asc",
      "nombre-desc",
      "precio-asc",
      "precio-desc",
      "stock-asc",
      "stock-desc",
    ])
    .optional(),
});

const esquemaVisibilidad = z.object({
  id: z.string().min(1),
  activo: z.boolean(),
});

export async function obtenerProductosAdmin(params: unknown): Promise<RespuestaProductosAdmin> {
  let tenantId: string;
  try {
    const contexto = await requiereAdmin();
    tenantId = contexto.tenantId;
  } catch {
    return { success: false, error: "No autorizado" };
  }

  const parsed = esquemaConsulta.safeParse(params);
  if (!parsed.success) return { success: false, error: "Parámetros inválidos" };

  try {
    const resultado = await consultarProductosAdmin(tenantId, {
      pagina: parsed.data.pagina,
      limite: parsed.data.limite,
      busqueda: parsed.data.busqueda,
      categoriaId: parsed.data.categoriaId,
      subcategoriaId: parsed.data.subcategoriaId,
      proveedorId: parsed.data.proveedorId,
      estado: parsed.data.estado,
      stock: parsed.data.stock === "todos" ? undefined : parsed.data.stock,
      orden: parsed.data.orden,
    });
    return { success: true, ...resultado };
  } catch (error) {
    console.error("Error al obtener productos admin:", error);
    return { success: false, error: "Error al cargar productos" };
  }
}

export async function actualizarVisibilidadProducto(id: string, activo: boolean) {
  let tenantId: string;
  try {
    const contexto = await requiereAdmin();
    tenantId = contexto.tenantId;
  } catch {
    return { error: "No autorizado" };
  }

  const parsed = esquemaVisibilidad.safeParse({ id, activo });
  if (!parsed.success) return { error: "Datos inválidos" };

  try {
    const resultado = await prisma.garment.updateMany({
      where: { id: parsed.data.id, tenantId },
      data: { active: parsed.data.activo },
    });
    if (resultado.count === 0) return { error: "Producto no encontrado" };
    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar visibilidad:", error);
    return { error: "No se pudo actualizar la visibilidad" };
  }
}
