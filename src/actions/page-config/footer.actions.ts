"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { footerSchema } from "@/lib/validaciones/esquemas";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

export async function updateFooterConfig(data: unknown) {
  try {
    const parsed = footerSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const config = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: { ...parsed.data },
      }),
    );

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);
    revalidatePath("/", "layout");
    return { ok: true, config };
  } catch {
    return { ok: false, error: "Error al actualizar la configuración del footer" };
  }
}
