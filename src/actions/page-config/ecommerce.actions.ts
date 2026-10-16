"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function updateEcommerceConfig(
  data: {
    ecommerceEnabled?: boolean;
    cartEnabled?: boolean;
    checkoutEnabled?: boolean;
    currency?: string;
  }
) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const ecommerce = await conPrismaTenant(contexto.tenantId, (prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id, tenantId: contexto.tenantId },
        data: {
          ecommerceEnabled: data.ecommerceEnabled,
          cartEnabled: data.cartEnabled,
          checkoutEnabled: data.checkoutEnabled,
          currency: data.currency,
        },
      }),
    );

    revalidateTag(`page-config:${contexto.tenantId}`);

    return { ok: true, ecommerce };
  } catch {
    return { ok: false, error: "Error ecommerce" };
  }
}

export async function getEcommerceConfig() {
  try {
    const { id: tenantId } = await requiereTenantActivo();
    const ecommerce = await conPrismaTenant(tenantId, (prisma) =>
      prisma.pageConfig.findFirst({
        where: { tenantId },

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
