"use server";

import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { extractPublicId } from "@/lib/cloudinary";

type PageConfigInput = {
  storeName?: string;

  description?: string | null;
  slogan?: string | null;

  logo?: string | null;
  favicon?: string | null;
  banner?: string | null;

  primaryColor?: string | null;
  secondaryColor?: string | null;

  ecommerceEnabled?: boolean;
  cartEnabled?: boolean;
  checkoutEnabled?: boolean;

  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;

  locationEnabled?: boolean;

  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  postalCode?: string | null;
  mapsUrl?: string | null;

  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  x?: string | null;
  youtube?: string | null;
  linkedin?: string | null;

  currency?: string;
  language?: string;

  maintenanceMode?: boolean;

  metaTitle?: string | null;
  metaDescription?: string | null;

  termsAndConditions?: string | null;
  privacyPolicy?: string | null;
};

const DEFAULT_VALUES = {
  storeName: "GestionOK",
  metaTitle: "GestionOK",
  metaDescription: "GestionOK",
};

// ======================================================
// UPDATE CONFIG
// CREA SI NO EXISTE
// ======================================================

export async function updatePageConfig(
  data: PageConfigInput
) {
  try {
    const existing =
      await prisma.pageConfig.findFirst();

    let finalLogo = data.logo || null;
    let finalBanner = data.banner || null;
    let finalFavicon =
      data.favicon || null;

    // =====================================
    // LOGO
    // =====================================

    if (
      data.logo &&
      data.logo.startsWith(
        "data:image"
      )
    ) {
      // eliminar anterior

      if (existing?.logo) {
        const publicId =
          extractPublicId(
            existing.logo
          );

        if (publicId) {
          await cloudinary.uploader.destroy(
            publicId
          );
        }
      }

      // subir nueva

      const uploadResponse =
        await cloudinary.uploader.upload(
          data.logo,
          {
            folder:
              "gestion-stock/page-config/logo",
          }
        );

      finalLogo =
        uploadResponse.secure_url;
    }

    // =====================================
    // BANNER
    // =====================================

    if (
      data.banner &&
      data.banner.startsWith(
        "data:image"
      )
    ) {
      if (existing?.banner) {
        const publicId =
          extractPublicId(
            existing.banner
          );

        if (publicId) {
          await cloudinary.uploader.destroy(
            publicId
          );
        }
      }

      const uploadResponse =
        await cloudinary.uploader.upload(
          data.banner,
          {
            folder:
              "gestion-stock/page-config/banner",
          }
        );

      finalBanner =
        uploadResponse.secure_url;
    }

    // =====================================
    // FAVICON
    // =====================================

    if (
      data.favicon &&
      data.favicon.startsWith(
        "data:image"
      )
    ) {
      if (existing?.favicon) {
        const publicId =
          extractPublicId(
            existing.favicon
          );

        if (publicId) {
          await cloudinary.uploader.destroy(
            publicId
          );
        }
      }

      const uploadResponse =
        await cloudinary.uploader.upload(
          data.favicon,
          {
            folder:
              "gestion-stock/page-config/favicon",
          }
        );

      finalFavicon =
        uploadResponse.secure_url;
    }

    // =====================================
    // CREATE
    // =====================================

    if (!existing) {
      const pageConfig =
        await prisma.pageConfig.create({
          data: {
            ...data,

            storeName:
              data.storeName ||
              DEFAULT_VALUES.storeName,

            metaTitle:
              data.metaTitle ||
              DEFAULT_VALUES.metaTitle,

            metaDescription:
              data.metaDescription ||
              DEFAULT_VALUES.metaDescription,

            logo: finalLogo,
            banner: finalBanner,
            favicon: finalFavicon,
          },
        });

      return {
        ok: true,
        created: true,
        pageConfig,
      };
    }

    // =====================================
    // UPDATE
    // =====================================

    const pageConfig =
      await prisma.pageConfig.update({
        where: {
          id: existing.id,
        },
        data: {
          ...data,

          logo: finalLogo,
          banner: finalBanner,
          favicon: finalFavicon,
        },
      });

    return {
      ok: true,
      created: false,
      pageConfig,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar configuración",
    };
  }
}

// ======================================================
// CLEAR CONFIG
// ======================================================

export async function clearPageConfig() {
  try {
    const existing =
      await prisma.pageConfig.findFirst();

    // si no existe la crea limpia

    if (!existing) {
      const pageConfig =
        await prisma.pageConfig.create({
          data: {
            storeName:
              DEFAULT_VALUES.storeName,

            metaTitle:
              DEFAULT_VALUES.metaTitle,

            metaDescription:
              DEFAULT_VALUES.metaDescription,

            primaryColor:
              "#06b6d4",

            secondaryColor:
              "#ffffff",

            ecommerceEnabled: false,
            cartEnabled: false,
            checkoutEnabled: false,

            locationEnabled: false,

            maintenanceMode: false,

            currency: "ARS",
            language: "es",
          },
        });

      return {
        ok: true,
        created: true,
        pageConfig,
      };
    }

    // =====================================
    // BORRAR IMÁGENES CLOUDINARY
    // =====================================

    const images = [
      existing.logo,
      existing.banner,
      existing.favicon,
    ];

    for (const image of images) {
      if (!image) continue;

      const publicId =
        extractPublicId(image);

      if (publicId) {
        await cloudinary.uploader.destroy(
          publicId
        );
      }
    }

    // =====================================
    // RESET
    // =====================================

    const pageConfig =
      await prisma.pageConfig.update({
        where: {
          id: existing.id,
        },
        data: {
          storeName:
            DEFAULT_VALUES.storeName,

          description: null,
          slogan: null,

          logo: null,
          favicon: null,
          banner: null,

          primaryColor:
            "#06b6d4",

          secondaryColor:
            "#ffffff",

          ecommerceEnabled: false,
          cartEnabled: false,
          checkoutEnabled: false,

          phone: null,
          whatsapp: null,
          email: null,

          locationEnabled: false,

          address: null,
          city: null,
          province: null,
          country: null,
          postalCode: null,
          mapsUrl: null,

          instagram: null,
          facebook: null,
          tiktok: null,
          x: null,
          youtube: null,
          linkedin: null,

          currency: "ARS",
          language: "es",

          maintenanceMode: false,

          metaTitle:
            DEFAULT_VALUES.metaTitle,

          metaDescription:
            DEFAULT_VALUES.metaDescription,

          termsAndConditions:
            null,

          privacyPolicy: null,
        },
      });

    return {
      ok: true,
      pageConfig,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al limpiar configuración",
    };
  }
}

// ======================================================
// GET GENERAL
// ======================================================

export async function getPageConfig() {
  try {
    const pageConfig =
      await prisma.pageConfig.findFirst();

    return {
      ok: true,
      pageConfig,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al obtener configuración",
    };
  }
}

// ======================================================
// GET BRANDING
// ======================================================

export async function getBrandingConfig() {
  try {
    const branding =
      await prisma.pageConfig.findFirst({
        select: {
          storeName: true,
          slogan: true,

          logo: true,
          favicon: true,
          banner: true,

          primaryColor: true,
          secondaryColor: true,
        },
      });

    return {
      ok: true,
      branding,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al obtener branding",
    };
  }
}

// ======================================================
// GET ECOMMERCE
// ======================================================

export async function getEcommerceConfig() {
  try {
    const ecommerce =
      await prisma.pageConfig.findFirst({
        select: {
          ecommerceEnabled: true,
          cartEnabled: true,
          checkoutEnabled: true,
          currency: true,
        },
      });

    return {
      ok: true,
      ecommerce,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al obtener ecommerce",
    };
  }
}

// ======================================================
// GET CONTACT
// ======================================================

export async function getContactConfig() {
  try {
    const contact =
      await prisma.pageConfig.findFirst({
        select: {
          phone: true,
          whatsapp: true,
          email: true,
        },
      });

    return {
      ok: true,
      contact,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al obtener contacto",
    };
  }
}

// ======================================================
// GET LOCATION
// ======================================================

export async function getLocationConfig() {
  try {
    const location =
      await prisma.pageConfig.findFirst({
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

    return {
      ok: true,
      location,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al obtener ubicación",
    };
  }
}

// ======================================================
// GET SOCIALS
// ======================================================

export async function getSocialsConfig() {
  try {
    const socials =
      await prisma.pageConfig.findFirst({
        select: {
          instagram: true,
          facebook: true,
          tiktok: true,
          x: true,
          youtube: true,
          linkedin: true,
        },
      });

    return {
      ok: true,
      socials,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al obtener redes sociales",
    };
  }
}

// ======================================================
// GET SEO
// ======================================================

export async function getSeoConfig() {
  try {
    const seo =
      await prisma.pageConfig.findFirst({
        select: {
          metaTitle: true,
          metaDescription: true,
        },
      });

    return {
      ok: true,
      seo,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al obtener SEO",
    };
  }
}