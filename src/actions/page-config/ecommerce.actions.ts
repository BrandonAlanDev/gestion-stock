"use server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function updateEcommerceConfig(
  data: {
    ecommerceEnabled?: boolean;
    cartEnabled?: boolean;
    checkoutEnabled?: boolean;
    currency?: string;
  }
) {
  try {
    const ecommerce =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data: {
          ecommerceEnabled:
            data.ecommerceEnabled,

          cartEnabled:
            data.cartEnabled,

          checkoutEnabled:
            data.checkoutEnabled,

          currency: data.currency,
        },
      });

    revalidateTag("page-config");

    return { ok: true, ecommerce };
  } catch {
    return { ok: false, error: "Error ecommerce" };
  }
}

export async function getEcommerceConfig() {
  try {
    const ecommerce =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },

        select: {
          ecommerceEnabled: true,
          cartEnabled: true,
          checkoutEnabled: true,
          currency: true,
        },
      });

    return { ok: true, ecommerce };
  } catch {
    return { ok: false, error: "Error ecommerce" };
  }
}