"use server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/upload-image";
import { unstable_cache } from 'next/cache';
import cloudinary, { extractPublicId } from "@/lib/cloudinary";
import { generateSeoImageData } from "@/actions/page-config/helpers";


type BrandingInput = {
  storeName?: string;

  slogan?: string | null;

  description?: string | null;

  logo?: string | null;

  banner?: string | null;

  favicon?: string | null;

  primaryColor?: string | null;

  secondaryColor?: string | null;
};

export async function updateBrandingConfig(
  data: BrandingInput
) {
  try {
    const existing =
      await prisma.pageConfig.findFirst();

    const storeName =
      data.storeName?.trim() ||
      existing?.storeName ||
      "GestionOK";

    let finalLogo =
      existing?.logo || null;

    let finalBanner =
      existing?.banner || null;

    let finalFavicon =
      existing?.favicon || null;

    // =====================================
    // LOGO
    // =====================================

    if (
      data.logo &&
      data.logo.startsWith(
        "data:image"
      )
    ) {
      if (existing?.logo) {
        const publicId =
          extractPublicId(
            existing.logo
          );

        if (publicId) {
          await cloudinary.uploader.destroy(
            publicId,
            {
              invalidate: true,
            }
          );
        }
      }

      const seo =
        generateSeoImageData(
          storeName,
          "logo"
        );

      const uploadedLogo = await uploadImage({ base64: data.logo, folder: seo.folder, publicId: seo.publicId, displayName: seo.displayName });

      finalLogo =
        uploadedLogo.secure_url;
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
            publicId,
            {
              invalidate: true,
            }
          );
        }
      }

      const seo =
        generateSeoImageData(
          storeName,
          "banner"
        );

      const uploadedBanner = await uploadImage({ base64: data.banner, folder: seo.folder, publicId: seo.publicId, displayName: seo.displayName });

      finalBanner =
        uploadedBanner.secure_url;
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
            publicId,
            {
              invalidate: true,
            }
          );
        }
      }

      const seo =
        generateSeoImageData(
          storeName,
          "favicon"
        );

      const uploadedFavicon = await uploadImage({ base64: data.favicon, folder: seo.folder, publicId: seo.publicId, displayName: seo.displayName });

      finalFavicon =
        uploadedFavicon.secure_url;
    }

    // =====================================
    // UPSERT
    // =====================================

    const payload = {
      storeName,

      slogan:
        data.slogan ?? null,

      description:
        data.description ??
        null,

      primaryColor:
        data.primaryColor ??
        "#06b6d4",

      secondaryColor:
        data.secondaryColor ??
        "#ffffff",

      logo: finalLogo,

      banner:
        finalBanner,

      favicon:
        finalFavicon,
    };

    const pageConfig =
      existing
        ? await prisma.pageConfig.update(
          {
            where: {
              id: existing.id,
            },

            data: payload,
          }
        )
        : await prisma.pageConfig.create(
          {
            data: payload,
          }
        );

    return {
      ok: true,
      pageConfig,
    };
  } catch (error) {
    console.error(
      "UPDATE BRANDING ERROR:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar branding",
    };
  }
}

/// =====================================
// GET BRANDING CONFIG (CACHEADO)
// =====================================
export const getBrandingConfig = unstable_cache(
  async () => {
    try {
      const branding = await prisma.pageConfig.findFirst({
        select: {
          storeName: true,
          slogan: true,
          description: true,
          logo: true,
          banner: true,
          favicon: true,
          primaryColor: true,
          secondaryColor: true,
        },
      });
      return { ok: true, branding };
    } catch (error) {
      console.error("GET BRANDING ERROR:", error);
      return { ok: false, error: error instanceof Error ? error.message : "Error al obtener branding" };
    }
  },
  ["branding-config"], // clave única
  { revalidate: 3600 }  // 1 hora
);