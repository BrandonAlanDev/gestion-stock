"use server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";

export async function updateSeoConfig(
  data: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const seo =
      await prisma.pageConfig.update({
        where: { id: pageConfig.id },

        data,
      });

    revalidateTag(`page-config:${contexto.tenantId}`);

    return { ok: true, seo };
  } catch {
    return { ok: false, error: "Error SEO" };
  }
}

export async function getSeoConfig() {
  try {
    const { id: tenantId } = await requiereTenantActivo();
    const seo =
      await prisma.pageConfig.findFirst({
        where: { tenantId },

        select: {
          metaTitle: true,
          metaDescription: true,
        },
      });

    return { ok: true, seo };
  } catch {
    return { ok: false, error: "Error SEO" };
  }
}
