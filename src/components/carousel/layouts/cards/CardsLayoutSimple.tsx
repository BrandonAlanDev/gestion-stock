"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { resolverEnlaceSlide } from "@/lib/enlaces/resolver-enlace-slide";

interface Slide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: { hideText?: boolean; linkType?: string };
}

interface CardsLayoutSimpleProps {
  slides: Slide[];
  settings: { columns?: string; cardHeight?: string; showSubtitle?: boolean; enableHoverZoom?: boolean };
}

export default function CardsLayoutSimple({ slides, settings }: CardsLayoutSimpleProps) {
  const columns = settings.columns || "md:grid-cols-2";
  const cardHeight = settings.cardHeight || "50vh";
  const showSubtitle = settings.showSubtitle ?? true;
  const enableHoverZoom = settings.enableHoverZoom ?? true;

  return (
    <motion.div
      className={"grid gap-0 " + columns}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      {slides.map((slide) => {
        const enlace = resolverEnlaceSlide(slide);
        return (
        <motion.article
          key={slide.id}
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
        >
          {enlace ? (
            <Link
              href={enlace}
              className="relative block overflow-hidden cursor-pointer group bg-[var(--color-secundario)] border border-[var(--color-secundario)] w-full"
              style={{ height: cardHeight }}
            >
              <motion.div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                style={{ backgroundImage: "url(" + slide.image + ")" }}
                animate={{ scale: enableHoverZoom ? 1.04 : 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {!slide.config?.hideText && (
                <div className="absolute inset-0 bg-black/45" />
              )}
              {!slide.config?.hideText && (
                <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end z-10">
                  {showSubtitle && slide.subtitle && (
                    <motion.p className="text-xs font-black tracking-[0.35em] uppercase mb-2" style={{ color: "var(--color-primario)" }}>
                      {"// " + slide.subtitle}
                    </motion.p>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <motion.h3 className="text-2xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                      {slide.title}
                    </motion.h3>
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <div className="group relative block w-full overflow-hidden border border-[var(--color-secundario)] bg-[var(--color-secundario)]" style={{ height: cardHeight }}>
              <motion.div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                style={{ backgroundImage: "url(" + slide.image + ")" }}
                animate={{ scale: enableHoverZoom ? 1.04 : 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {!slide.config?.hideText && (
                <div className="absolute inset-0 bg-black/45" />
              )}
              {!slide.config?.hideText && (
                <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end z-10">
                  {showSubtitle && slide.subtitle && (
                    <motion.p className="text-xs font-black tracking-[0.35em] uppercase mb-2" style={{ color: "var(--color-primario)" }}>
                      {"// " + slide.subtitle}
                    </motion.p>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <motion.h3 className="text-2xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                      {slide.title}
                    </motion.h3>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.article>
      );
      })}
    </motion.div>
  );
}
