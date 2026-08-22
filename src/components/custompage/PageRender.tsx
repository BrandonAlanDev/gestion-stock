"use client";

import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import CardsSection from "./sections/CardsSection";
import TimelineSection from "./sections/TimelineSection";
import FaqSection from "./sections/FaqSection";
import CtaSection from "./sections/CtaSection";

export interface CustomItem {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  link?: string | null;
  order: number;
  config?: any;
}

export interface CustomSection {
  id: string;
  type: "HERO" | "TEXT" | "CARDS" | "FAQ" | "TIMELINE" | "CTA" | "GALLERY" | "FEATURES";
  title?: string | null;
  subtitle?: string | null;
  order: number;
  config?: any;
  items: CustomItem[];
}

export interface CustomPage {
  slug: string;
  title: string;
  subtitle?: string | null;
  sections: CustomSection[];
}

export default function PageRenderer({ page }: { page: CustomPage }) {
  return (
    <main className="w-full min-h-screen bg-white pt-24 uppercase tracking-wide selection:bg-[#f0fafa] selection:text-[#0d5c63]">
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </main>
  );
}

function SectionRenderer({ section }: { section: CustomSection }) {
  switch (section.type) {
    case "HERO":
      return <HeroSection section={section} />;
    case "FEATURES":
      return <FeaturesSection section={section} />;
    case "CARDS":
      return <CardsSection section={section} />;
    case "TIMELINE":
      return <TimelineSection section={section} />;
    case "FAQ":
      return <FaqSection section={section} />;
    case "CTA":
      return <CtaSection section={section} />;
    default:
      return null;
  }
}
