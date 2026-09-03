"use server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";

export async function updateLocationConfig(
  data: {
    locationEnabled?: boolean;

    address?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    postalCode?: string | null;
    mapsUrl?: string | null;
  }
) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    const location =
      await prisma.pageConfig.update({
        where: { id: pageConfig.id },

        data,
      });

    revalidateTag(`page-config:${contexto.tenantId}`);
    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}

export async function getLocationConfig() {
  try {
    const { id: tenantId } = await requiereTenantActivo();
    const location =
      await prisma.pageConfig.findFirst({
        where: { tenantId },

        select: {
          locationEnabled: true,

          address: true,
          city: true,
          province: true,
          country: true,
          postalCode: true,

          mapsUrl: true,
        },
      });

    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}
