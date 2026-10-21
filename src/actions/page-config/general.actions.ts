"use server";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { obtenerTenantDeSesion } from "@/lib/tenants/obtener-tenant-de-sesion";
import { conPrismaTenant } from "@/lib/prisma";
import { DEFAULT_VALUES } from "@/actions/page-config/shared/defaults";
import { TIPOS_CARRUSEL_ADMITIDOS } from "@/lib/services/carruseles/constantes";

async function obtenerPageConfigCacheada(tenantId: string) {
  try {
    return await unstable_cache(
    async () => {
    const { pageConfig, homegrids } = await conPrismaTenant(tenantId, async (prisma) => {
      const cargar = () => prisma.pageConfig.findUnique({
      where: { clave: "principal" },
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
          where: {},
          orderBy: {
            order: "asc",
          },
        },

        homegridId: true,

        carousels: {
          where: { type: { in: [...TIPOS_CARRUSEL_ADMITIDOS] } },
          select: {
            id: true,
            type: true,
            title: true,
            active: true,
            settings: true,
          },
        },
      },
      });
      const [existente, homegrids] = await Promise.all([
        cargar(),
        prisma.homegrid.findMany({
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            title: true,
            subtitle: true,
            style: true,
            columns: true,
            active: true,
            featuredLayout: true,
            grids: { orderBy: [{ order: "asc" }, { title: "asc" }] },
          },
        }),
      ]);
      if (existente) return { pageConfig: existente, homegrids };
      await prisma.pageConfig.upsert({
        where: { clave: "principal" },
        update: {},
        create: {
          storeName: DEFAULT_VALUES.storeName,
          primaryColor: DEFAULT_VALUES.primaryColor,
          secondaryColor: DEFAULT_VALUES.secondaryColor,
          bgColor: DEFAULT_VALUES.bgColor,
        },
      });
      return { pageConfig: await cargar(), homegrids };
    });
    if (!pageConfig) {
      throw new Error("Configuración de página no encontrada");
    }

    return {
      ok: true as const,
      pageConfig: {
        ...pageConfig,
        homegrid: homegrids.find((homegrid) => homegrid.id === pageConfig.homegridId) ?? null,
        homegrids,
      },
    };
    },
    [`tenant:${tenantId}:page-config-completa`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:page-config`] }
    )();
  } catch (error: unknown) {
    console.error("Error real:", error instanceof Error ? error.message : error);
    return { ok: false as const, pageConfig: null, error: "Error configuración" };
  }
}

const obtenerPageConfigSolicitud = cache(async () => {
  const { id: tenantId } = await requiereTenantActivo();
  return obtenerPageConfigCacheada(tenantId);
});

export async function getPageConfig() {
  const resultado = await obtenerPageConfigSolicitud();
  if (!resultado.ok || !resultado.pageConfig) return resultado;

  const sesion = await obtenerTenantDeSesion();
  if (sesion?.rol === "ADMIN") return resultado;

  return {
    ...resultado,
    pageConfig: {
      ...resultado.pageConfig,
      homegrids: resultado.pageConfig.homegrids.filter((homegrid) => homegrid.active),
      carousels: resultado.pageConfig.carousels.filter((carousel) => carousel.active),
    },
  };
}
