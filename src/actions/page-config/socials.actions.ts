"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function updateSocialsConfig(
  data: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    x?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  }
) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const socials = await conPrismaTenant(contexto.tenantId, (prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data,
      }),
    );

    revalidateTag(`page-config:${contexto.tenantId}`);

    return { ok: true, socials };
  } catch {
    return { ok: false, error: "Error redes sociales" };
  }
}

export async function getSocialsConfig() {
  try {
    const { id: tenantId } = await requiereTenantActivo();
    const socials = await conPrismaTenant(tenantId, (prisma) =>
      prisma.pageConfig.findFirst({
        where: {},

        select: {
          instagram: true,
          facebook: true,
          tiktok: true,
          x: true,
          youtube: true,
          linkedin: true,
        },
      }),
    );

    return { ok: true, socials };
  } catch {
    return { ok: false, error: "Error redes sociales" };
  }
}
