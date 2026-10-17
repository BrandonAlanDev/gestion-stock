"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

const esquemaVisibilidad = z.object({
  id: z.string().min(1),
  activo: z.boolean(),
});

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
    const resultado = await conPrismaTenant(tenantId, (prisma) =>
      prisma.garment.updateMany({
        where: { id: parsed.data.id },
        data: { active: parsed.data.activo },
      }),
    );
    if (resultado.count === 0) return { error: "Producto no encontrado" };
    revalidateTag(`tenant:${tenantId}:products`);
    revalidateTag(`tenant:${tenantId}:product:${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar visibilidad:", error);
    return { error: "No se pudo actualizar la visibilidad" };
  }
}
