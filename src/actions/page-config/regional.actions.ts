"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";
import { regionalSchema } from "@/lib/zod";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";

export async function updateRegionalConfig(data: unknown) {
  try {
    const parsed = regionalSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const config = await prisma.pageConfig.update({
      where: { id: pageConfig.id },
      data: { ...parsed.data },
    });

    revalidateTag(`page-config:${contexto.tenantId}`);
    revalidatePath("/");
    return { ok: true, config };
  } catch {
    return { ok: false, error: "Error al actualizar la configuración regional" };
  }
}
