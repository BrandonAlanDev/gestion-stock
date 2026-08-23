"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";
import { footerSchema } from "@/lib/zod";

export async function updateFooterConfig(data: unknown) {
  try {
    const parsed = footerSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const config = await prisma.pageConfig.update({
      where: { id: 1 },
      data: { ...parsed.data },
    });

    revalidateTag("page-config");
    revalidatePath("/", "layout");
    return { ok: true, config };
  } catch {
    return { ok: false, error: "Error al actualizar la configuración del footer" };
  }
}
