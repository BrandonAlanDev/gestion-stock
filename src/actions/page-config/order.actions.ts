"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateSectionOrder(sections: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Debe proporcionar un array de secciones" };
  }

  if (!sections.every((s) => typeof s === "string")) {
    return { error: "Todas las secciones deben ser strings" };
  }

  try {
    await prisma.pageConfig.update({
      where: { id: 1 },
      data: { sectionOrder: JSON.stringify(sections) },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating section order:", error);
    return { error: "Error al guardar el orden" };
  }
}
