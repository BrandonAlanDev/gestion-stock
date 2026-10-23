"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { z } from "zod";
import { conPrisma } from "@/lib/prisma";

const esquemaEcommerce = z.object({
  ecommerceEnabled: z.boolean().optional(),
  cartEnabled: z.boolean().optional(),
  checkoutEnabled: z.boolean().optional(),
  envioDomicilioEnabled: z.boolean().optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
});

export async function updateEcommerceConfig(
  data: z.input<typeof esquemaEcommerce>,
) {
  const validacion = esquemaEcommerce.safeParse(data);
  if (!validacion.success) return { ok: false, error: "Datos de tienda inválidos" };

  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const ecommerce = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: validacion.data,
      }),
    );

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);

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
          envioDomicilioEnabled: true,
          currency: true,
        },
      }),
    );

    return { ok: true, ecommerce };
  } catch {
    return { ok: false, error: "Error ecommerce" };
  }
}
