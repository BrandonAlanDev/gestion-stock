import { getPageConfig } from "@/actions/page-config/general.actions";
import PanelConfiguracion from "@/components/admin/configuracion/PanelConfiguracion";
import type { ConfigCompleta } from "@/components/admin/configuracion/tipos-configuracion";

export default async function PageConfigPage() {
  const resultado = await getPageConfig();
  const pageConfig = resultado.ok ? resultado.pageConfig : null;

  const config: ConfigCompleta | null = pageConfig
    ? {
        storeName: pageConfig.storeName ?? "GestionOK",
        slogan: pageConfig.slogan ?? null,
        description: pageConfig.description ?? null,
        logo: pageConfig.logo ?? null,
        favicon: pageConfig.favicon ?? null,
        primaryColor: pageConfig.primaryColor ?? "#06b6d4",
        secondaryColor: pageConfig.secondaryColor ?? "#ffffff",
        fontPrimary: pageConfig.fontPrimary ?? "Outfit",
        fontSecondary: pageConfig.fontSecondary ?? "Playfair Display",
        borderRadius: pageConfig.borderRadius ?? "redondeado",
        shadowLevel: pageConfig.shadowLevel ?? "sutil",
        density: pageConfig.density ?? "comoda",
        banners: pageConfig.banners.map((banner) => ({
          id: banner.id,
          image: banner.image ?? null,
          title: banner.title ?? null,
          subtitle: banner.subtitle ?? null,
          text: banner.text ?? null,
          url: banner.url ?? null,
        })),
        phone: pageConfig.phone ?? null,
        whatsapp: pageConfig.whatsapp ?? null,
        email: pageConfig.email ?? null,
        locationEnabled: pageConfig.locationEnabled ?? false,
        address: pageConfig.address ?? null,
        city: pageConfig.city ?? null,
        province: pageConfig.province ?? null,
        country: pageConfig.country ?? null,
        instagram: pageConfig.instagram ?? null,
        facebook: pageConfig.facebook ?? null,
        tiktok: pageConfig.tiktok ?? null,
        x: pageConfig.x ?? null,
        youtube: pageConfig.youtube ?? null,
        linkedin: pageConfig.linkedin ?? null,
        ecommerceEnabled: pageConfig.ecommerceEnabled ?? true,
        cartEnabled: pageConfig.cartEnabled ?? true,
        checkoutEnabled: pageConfig.checkoutEnabled ?? true,
        currency: pageConfig.currency ?? "ARS",
        language: pageConfig.language ?? "es",
        maintenanceMode: pageConfig.maintenanceMode ?? false,
        arreglosEnabled: pageConfig.arreglosEnabled ?? true,
        escuelaEnabled: pageConfig.escuelaEnabled ?? true,
        personalizadoEnabled: pageConfig.personalizadoEnabled ?? true,
        metaTitle: pageConfig.metaTitle ?? null,
        metaDescription: pageConfig.metaDescription ?? null,
        termsAndConditions: pageConfig.termsAndConditions ?? null,
        privacyPolicy: pageConfig.privacyPolicy ?? null,
      }
    : null;

  return <PanelConfiguracion config={config} />;
}
