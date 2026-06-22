"use client";

import ContactSection from "@/components/admin/page-config/ContactSection"
import EcommerceSection from "@/components/admin/page-config/EcommerceSection"
import LocationSection from "@/components/admin/page-config/LocationSection"
import BrandingSection from "@/components/admin/page-config/BrandingSection"
import SeoSection from "@/components/admin/page-config/SeoSection"
import SocialsSection from "@/components/admin/page-config/SocialsSection"
import {usePageConfig} from "@/components/providers/PageConfigProvider";

export default function PageConfigForm({
  config,
}: any) {
  const { pageConfig } = usePageConfig();

  return (
    <div className="space-y-8">
      <BrandingSection
        config={config}
        primaryColor={pageConfig?.primaryColor}
        secondaryColor={pageConfig?.secondaryColor}
      />

      <EcommerceSection
        config={config}
        primaryColor={pageConfig?.primaryColor}
        secondaryColor={pageConfig?.secondaryColor}
      />

      <ContactSection
        config={config}
        primaryColor={pageConfig?.primaryColor}
        secondaryColor={pageConfig?.secondaryColor}
      />

      <SocialsSection
        config={config}
        primaryColor={pageConfig?.primaryColor}
        secondaryColor={pageConfig?.secondaryColor}
      />

      <SeoSection
        config={config}
        primaryColor={pageConfig?.primaryColor}
        secondaryColor={pageConfig?.secondaryColor}
      />

      <LocationSection
        config={config}
        primaryColor={pageConfig?.primaryColor}
        secondaryColor={pageConfig?.secondaryColor}
      />
    </div>
  );
}