"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { getOrCreatePageConfig } from "@/actions/page-config/shared/get-page-config";

async function obtenerPageConfigCacheada(tenantId: string) {
  return unstable_cache(
    async () => {
  try {
    const pageConfig = await prisma.pageConfig.findFirst({
      where: { tenantId },
      select: {
        storeName: true,
        slogan: true,
        description: true,
        logo: true,
        favicon: true,
        primaryColor: true,
        secondaryColor: true,
        bgColor: true,
        fontPrimary: true,
        fontSecondary: true,
        borderRadius: true,
        shadowLevel: true,
        density: true,
        ecommerceEnabled: true,
        cartEnabled: true,
        checkoutEnabled: true,
        phone: true,
        whatsapp: true,
        email: true,
        locationEnabled: true,
        address: true,
        city: true,
        province: true,
        country: true,
        postalCode: true,
        mapsUrl: true,
        instagram: true,
        facebook: true,
        tiktok: true,
        x: true,
        youtube: true,
        linkedin: true,
        currency: true,
        language: true,
        maintenanceMode: true,
        footerAboutText: true,
        footerCopyrightText: true,
        footerShowSobre: true,
        footerShowNavegacion: true,
        footerShowContacto: true,
        footerShowUbicacion: true,
        footerShowRedes: true,
        footerShowLegales: true,
        metaTitle: true,
        metaDescription: true,
        termsAndConditions: true,
        privacyPolicy: true,
        featuredLayout: true,
        sectionOrder: true,

        // Mantenemos tus banners
        banners: {
          orderBy: {
            order: "asc",
          },
        },

        homegrid: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            style: true,
            columns: true,
            grids: {
              orderBy: [{
                order: "asc",
              },{
                title: "asc",
              },],
            },
          },
        },

        carousels: {
          select: {
            id: true,
            type: true,
            title: true,
            settings: true,
          },
        },
      },
    });

    return {
      ok: true,
      pageConfig,
    };
  } catch (error: unknown) {
    console.error("Error real:", error instanceof Error ? error.message : error);
    return {
      ok: false,
      error: "Error configuración",
    };
  }
    },
    [`page-config-completa:${tenantId}`],
    { revalidate: 3600, tags: [`page-config:${tenantId}`] }
  )();
}

export async function getPageConfig() {
  const { id: tenantId } = await requiereTenantActivo();
  await getOrCreatePageConfig(tenantId);
  return obtenerPageConfigCacheada(tenantId);
}
