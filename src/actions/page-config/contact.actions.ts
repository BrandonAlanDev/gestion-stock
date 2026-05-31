"use server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function updateContactConfig(
  data: {
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  }
) {
  try {
    const contact =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data: {
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
        },
      });

    revalidateTag("page-config");
    return { ok: true, contact };
  } catch {
    return { ok: false, error: "Error contacto" };
  }
}

export async function getContactConfig() {
  try {
    const contact =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },

        select: {
          phone: true,
          whatsapp: true,
          email: true,
        },
      });
    return { ok: true, contact };
  } catch {
    return { ok: false, error: "Error contacto" };
  }
}