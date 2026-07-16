"use server";

import { prisma } from "@/lib/prisma";

export async function getPageConfig() {
  try {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: {
        storeName: true,
        slogan: true,
        description: true,
        logo: true,
        favicon: true,
        primaryColor: true,
        secondaryColor: true,
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
            type: true,
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
}