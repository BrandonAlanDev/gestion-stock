"use client";
import { ShoppingCart, Phone, Globe, Search, MapPin } from "lucide-react";
import ContactSection from "@/components/admin/page-config/ContactSection";
import EcommerceSection from "@/components/admin/page-config/EcommerceSection";
import LocationSection from "@/components/admin/page-config/LocationSection";
import SeoSection from "@/components/admin/page-config/SeoSection";
import SocialsSection from "@/components/admin/page-config/SocialsSection";
import CollapsibleSection from "@/components/admin/design/CollapsibleSection";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

export default function PageConfigForm() {
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";

  return (
    <div className="space-y-6">
      <CollapsibleSection
        title="Ecommerce"
        subtitle="Tienda · Carrito · Checkout"
        icon={ShoppingCart}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <EcommerceSection
            config={pageConfig}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Contacto"
        subtitle="Teléfono · WhatsApp · Email"
        icon={Phone}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <ContactSection
            config={pageConfig}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Redes Sociales"
        subtitle="Instagram · Facebook · TikTok · X · YouTube · LinkedIn"
        icon={Globe}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <SocialsSection
            config={pageConfig}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="SEO"
        subtitle="Meta Título · Meta Descripción"
        icon={Search}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <SeoSection
            config={pageConfig}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Ubicación"
        subtitle="Dirección · Maps · Horarios"
        icon={MapPin}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <LocationSection
            config={pageConfig}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}