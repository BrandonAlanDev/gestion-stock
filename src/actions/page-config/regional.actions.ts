"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";
import { regionalSchema } from "@/lib/zod";

export async function updateRegionalConfig(data: unknown) {
  try {
    const parsed = regionalSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const config = await prisma.pageConfig.update({
      where: { id: 1 },
      data: { ...parsed.data },
    });

    revalidateTag("page-config");
    revalidatePath("/");
    return { ok: true, config };
  } catch {
    return { ok: false, error: "Error al actualizar la configuración regional" };
  }
}
