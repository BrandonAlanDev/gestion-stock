"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const VALID_SECTIONS = ["hero", "banner", "featured", "cards", "location"] as const;
type SectionId = typeof VALID_SECTIONS[number];

export async function updateSectionOrder(sections: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Debe proporcionar un array de secciones" };
  }

  const valid = sections.every((s) => VALID_SECTIONS.includes(s));
  if (!valid) {
    return { error: `Secciones inválidas. Válidas: ${VALID_SECTIONS.join(", ")}` };
  }

  const allPresent = VALID_SECTIONS.every((s) => sections.includes(s));
  if (!allPresent) {
    return { error: "Deben incluirse todas las secciones" };
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
