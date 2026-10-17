"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { regionalSchema } from "@/lib/validaciones/esquemas";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

export async function updateRegionalConfig(data: unknown) {
  try {
    const parsed = regionalSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const { pageConfig } = await requerirPageConfigAdministrador();
    const config = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: { ...parsed.data },
      }),
    );

    revalidateTag(`page-config`);
    revalidatePath("/");
    return { ok: true, config };
  } catch {
    return { ok: false, error: "Error al actualizar la configuración regional" };
  }
}
