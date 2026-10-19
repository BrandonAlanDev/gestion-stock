"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

export async function updateSeoConfig(
  data: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const seo = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data,
      }),
    );

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);

    return { ok: true, seo };
  } catch {
    return { ok: false, error: "Error SEO" };
  }
}

export async function getSeoConfig() {
  try {
    await requiereTenantActivo();
    const seo = await conPrisma((prisma) =>
      prisma.pageConfig.findFirst({
        where: {},

        select: {
          metaTitle: true,
          metaDescription: true,
        },
      }),
    );

    return { ok: true, seo };
  } catch {
    return { ok: false, error: "Error SEO" };
  }
}
