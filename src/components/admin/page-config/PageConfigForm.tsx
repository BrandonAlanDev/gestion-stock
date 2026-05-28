"use client";

import BrandingSection from "./BrandingSection";

import EcommerceSection from "./EcommerceSection";

import ContactSection from "./ContactSection";

import SocialsSection from "./SocialsSection";

import SeoSection from "./SeoSection";

import LocationSection from "./LocationSection";

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