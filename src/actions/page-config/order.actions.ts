"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";

export async function updateSectionOrder(sections: unknown) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Debe proporcionar un array de secciones" };
  }

  if (!sections.every((s) => typeof s === "string")) {
    return { error: "Todas las secciones deben ser strings" };
  }

  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    await conPrismaTenant(contexto.tenantId, (prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id, tenantId: contexto.tenantId },
        data: { sectionOrder: JSON.stringify(sections) },
      }),
    );

    revalidateTag(`page-config:${contexto.tenantId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating section order:", error);
    return { error: "Error al guardar el orden" };
  }
}
