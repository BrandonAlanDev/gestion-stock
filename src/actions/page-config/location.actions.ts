"use server";
import { revalidateTag } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

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
    const { pageConfig } = await requerirPageConfigAdministrador();
    const location = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data,
      }),
    );

    revalidateTag(`page-config`);
    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}

export async function getLocationConfig() {
  try {
    await requiereTenantActivo();
    const location = await conPrisma((prisma) =>
      prisma.pageConfig.findFirst({
        where: {},

        select: {
          locationEnabled: true,

          address: true,
          city: true,
          province: true,
          country: true,
          postalCode: true,

          mapsUrl: true,
        },
      }),
    );

    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}
