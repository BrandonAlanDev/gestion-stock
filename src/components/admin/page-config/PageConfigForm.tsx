"use client";
import ContactSection from "@/components/admin/page-config/ContactSection";
import EcommerceSection from "@/components/admin/page-config/EcommerceSection";
import LocationSection from "@/components/admin/page-config/LocationSection";
import BrandingSection from "@/components/admin/page-config/BrandingSection";
import SeoSection from "@/components/admin/page-config/SeoSection";
import SocialsSection from "@/components/admin/page-config/SocialsSection";

//import CarouselSection from "@/components/admin/page-config/CarouselSection";
import HomeSections from "@/components/admin/page-config/homeSections";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

export default function PageConfigForm({ config }: any) {
  const { pageConfig } = usePageConfig();

  const data = (pageConfig && Object.keys(pageConfig).length > 0) ? pageConfig : config;

  return (
    <div className="space-y-8">
      <BrandingSection
        config={data}
        primaryColor={data?.primaryColor}
        secondaryColor={data?.secondaryColor}
      />

      <EcommerceSection
        config={data}
        primaryColor={data?.primaryColor}
        secondaryColor={data?.secondaryColor}
      />

      <ContactSection
        config={data}
        primaryColor={data?.primaryColor}
        secondaryColor={data?.secondaryColor}
      />

      <SocialsSection
        config={data}
        primaryColor={data?.primaryColor}
        secondaryColor={data?.secondaryColor}
      />

      <SeoSection
        config={data}
        primaryColor={data?.primaryColor}
        secondaryColor={data?.secondaryColor}
      />

      <LocationSection
        config={data}
        primaryColor={data?.primaryColor}
        secondaryColor={data?.secondaryColor}
      />

      <HomeSections
        config={data}
        primaryColor={data?.primaryColor}
        secondaryColor={data?.secondaryColor}
      />
{/*
      <CarouselSection
        initialConfig={{
          carouselType: pageConfig.carouselType,
          carouselAutoplay: pageConfig.carouselAutoplay,
          carouselInterval: pageConfig.carouselInterval,
        }}
      />
*/}
    </div>
  );
}