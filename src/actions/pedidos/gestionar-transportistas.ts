"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { conPrisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

const esquema = z.object({
  id: z.string().trim().max(191).optional(),
  nombre: z.string().trim().min(2).max(100),
  plantillaUrl: z.string().trim().max(1000).optional(),
  requiereUrl: z.boolean(),
  activo: z.boolean(),
});

export async function guardarTransportista(datos: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = esquema.safeParse(datos);
  if (!parsed.success) return { ok: false, error: "Datos de transportista inválidos" };
  try {
    await requiereAdmin();
    const { id, nombre, plantillaUrl, requiereUrl, activo } = parsed.data;
    if (plantillaUrl) {
      const url = new URL(plantillaUrl.replaceAll("{codigo}", "ejemplo"));
      if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, error: "La URL debe usar HTTP o HTTPS" };
    }
    const guardado = await conPrisma(async (prisma) => {
      if (id) {
        const resultado = await prisma.transportista.updateMany({ where: { id }, data: { nombre, plantillaUrl: plantillaUrl || null, requiereUrl, activo } });
        return resultado.count === 1;
      }
      const slugBase = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "transportista";
      await prisma.transportista.create({ data: { nombre, slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`, plantillaUrl: plantillaUrl || null, requiereUrl, activo } });
      return true;
    });
    if (!guardado) return { ok: false, error: "Transportista inexistente" };
    revalidatePath("/admin/transportistas");
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (error) {
    console.error("Error guardando transportista:", error);
    return { ok: false, error: "No se pudo guardar el transportista" };
  }
}
