"use client";

import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import CardsSection from "./sections/CardsSection";
import TimelineSection from "./sections/TimelineSection";
import FaqSection from "./sections/FaqSection";
import CtaSection from "./sections/CtaSection";
import type {
  ItemPaginaPersonalizada,
  PaginaPersonalizada,
  SeccionPaginaPersonalizada,
} from "@/types/paginas-personalizadas";

export type CustomItem = ItemPaginaPersonalizada;
export type CustomSection = SeccionPaginaPersonalizada;
export type CustomPage = PaginaPersonalizada;

export default function PageRenderer({ page }: { page: CustomPage }) {
  return (
    <main className="w-full min-h-screen bg-[var(--color-fondo-sitio)] text-[var(--texto-sobre-fondo)] pt-24 uppercase tracking-wide selection:bg-[var(--color-primario)] selection:text-[var(--texto-sobre-primario)]">
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
