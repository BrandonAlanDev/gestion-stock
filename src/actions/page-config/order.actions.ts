"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
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
    await prisma.pageConfig.update({
      where: { id: pageConfig.id },
      data: { sectionOrder: JSON.stringify(sections) },
    });

    revalidateTag(`page-config:${contexto.tenantId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating section order:", error);
    return { error: "Error al guardar el orden" };
  }
}
