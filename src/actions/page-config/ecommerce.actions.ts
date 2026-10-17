"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

export async function updateEcommerceConfig(
  data: {
    ecommerceEnabled?: boolean;
    cartEnabled?: boolean;
    checkoutEnabled?: boolean;
    currency?: string;
  }
) {
  try {
    const { pageConfig } = await requerirPageConfigAdministrador();
    const ecommerce = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: {
          ecommerceEnabled: data.ecommerceEnabled,
          cartEnabled: data.cartEnabled,
          checkoutEnabled: data.checkoutEnabled,
          currency: data.currency,
        },
      }),
    );

    revalidateTag(`page-config`);

    return { ok: true, ecommerce };
  } catch {
    return { ok: false, error: "Error ecommerce" };
  }
}

export async function getEcommerceConfig() {
  try {
    await requiereTenantActivo();
    const ecommerce = await conPrisma((prisma) =>
      prisma.pageConfig.findFirst({
        where: {},

        select: {
          ecommerceEnabled: true,
          cartEnabled: true,
          checkoutEnabled: true,
          currency: true,
        },
      }),
    );

    return { ok: true, ecommerce };
  } catch {
    return { ok: false, error: "Error ecommerce" };
  }
}
