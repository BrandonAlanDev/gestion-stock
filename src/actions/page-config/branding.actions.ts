"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { conPrisma, conPrismaTenant } from "@/lib/prisma";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { getOrCreatePageConfig } from "@/actions/page-config/shared/get-page-config";

type BrandingInput = {
  storeName?: string;
  slogan?: string | null;
  description?: string | null;
  logo?: string | null;
  favicon?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  bgColor?: string | null;

  fontPrimary?: string;
  fontSecondary?: string;
  borderRadius?: string;
  shadowLevel?: string;
  density?: string;
};

export async function updateBrandingConfig(data: BrandingInput) {
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();

    const logoAnterior = pageConfig?.logo ?? null;
    const faviconAnterior = pageConfig?.favicon ?? null;

    const payload = {
      storeName: data.storeName?.trim() || pageConfig?.storeName || "GestionOK",

      slogan: data.slogan ?? pageConfig?.slogan ?? null,

      description: data.description ?? pageConfig?.description ?? null,

      primaryColor: data.primaryColor ?? pageConfig?.primaryColor ?? "#06b6d4",

      secondaryColor:
        data.secondaryColor ?? pageConfig?.secondaryColor ?? "#ffffff",

      bgColor: data.bgColor ?? pageConfig?.bgColor ?? "#09090b",

      logo: data.logo === undefined ? pageConfig?.logo ?? null : data.logo?.trim() || null,

      favicon: data.favicon === undefined ? pageConfig?.favicon ?? null : data.favicon?.trim() || null,

      fontPrimary: data.fontPrimary ?? pageConfig?.fontPrimary ?? "Outfit",

      fontSecondary:
        data.fontSecondary ?? pageConfig?.fontSecondary ?? "Playfair Display",

      borderRadius:
        data.borderRadius ?? pageConfig?.borderRadius ?? "redondeado",

      shadowLevel: data.shadowLevel ?? pageConfig?.shadowLevel ?? "sutil",

      density: data.density ?? pageConfig?.density ?? "comoda",
    };

    const pageConfigActualizado = await conPrisma((prisma) =>
      pageConfig
        ? prisma.pageConfig.update({
            where: { id: pageConfig.id },
            data: payload,
          })
        : prisma.pageConfig.create({
            data: { ...payload },
          }),
    );

    const publicIdsAEliminar: Array<string | null | undefined> = [];

    if (payload.logo !== logoAnterior) {
      const publicIdLogo = obtenerPublicIdDesdeUrl(logoAnterior ?? "");
      if (publicIdLogo) publicIdsAEliminar.push(publicIdLogo);
    }

    if (payload.favicon !== faviconAnterior) {
      const publicIdFavicon = obtenerPublicIdDesdeUrl(faviconAnterior ?? "");
      if (publicIdFavicon) publicIdsAEliminar.push(publicIdFavicon);
    }

    await eliminarImagenes(publicIdsAEliminar, contexto.tenantId);

    revalidateTag(`page-config`);
    revalidateTag(`branding-config`);

    return {
      ok: true,
      pageConfig: pageConfigActualizado,
    };
  } catch (error) {
    console.error("[CLOUDINARY][PAGE-CONFIG][BRANDING]", error);

    return {
      ok: false,
      error: "Error al actualizar branding",
    };
  }
}

async function obtenerBrandingCacheado(tenantId: string) {
 return unstable_cache(
  async () => {
    try {
      const branding = await conPrismaTenant(tenantId, (prisma) =>
        prisma.pageConfig.findFirst({
          where: {},
          select: {
          storeName: true,
          slogan: true,
          description: true,
          logo: true,
          favicon: true,
          primaryColor: true,
          secondaryColor: true,
          bgColor: true,

          banners: {
            where: {},
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              order: true,
              image: true,
              title: true,
              subtitle: true,
              text: true,
              url: true,
            },
          },
          },
        }),
      );

      return {
        ok: true,
        branding,
      };
    } catch (error) {
      console.error("[CLOUDINARY][PAGE-CONFIG][BRANDING][GET]", error);

      return {
        ok: false,
        error: "Error al obtener branding",
      };
    }
  },
  [`tenant:${tenantId}:branding-config`],
  {
    revalidate: 3600,
    tags: [`branding-config`],
  },
  )();
}

export async function getBrandingConfig() {
  const { id: tenantId } = await requiereTenantActivo();
  await getOrCreatePageConfig(tenantId);
  return obtenerBrandingCacheado(tenantId);
}
