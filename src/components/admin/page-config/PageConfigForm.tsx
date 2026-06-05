"use client";

import ContactSection from "@/components/admin/page-config/ContactSection"
import EcommerceSection from "@/components/admin/page-config/EcommerceSection"
import LocationSection from "@/components/admin/page-config/LocationSection"
import BrandingSection from "@/components/admin/page-config/BrandingSection"
import SeoSection from "@/components/admin/page-config/SeoSection"
import SocialsSection from "@/components/admin/page-config/SocialsSection"

export default function PageConfigForm({
  config,
}: any) {
  return (
    <div className="space-y-8">
      <BrandingSection
        config={config}
      />

      <EcommerceSection
        config={config}
      />

      <ContactSection
        config={config}
      />

      <SocialsSection
        config={config}
      />

      <SeoSection
        config={config}
      />

      <LocationSection
        config={config}
      />
    </div>
  );
}