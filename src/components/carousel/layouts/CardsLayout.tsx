"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: Record<string, unknown>;
}

interface CardsLayoutProps {
  carousel: {
    id: string;
    title?: string;
    settings: {
      layout?: "grid" | "collage" | "minimal";
      columns?: string;
      cardHeight?: string;
      showSubtitle?: boolean;
      enableHoverZoom?: boolean;
    };
    slides: CarouselSlide[];
  };
  primaryColor?: string;
}

export default function CardsLayout({ carousel, primaryColor = "#06b6d4" }: CardsLayoutProps) {
  const { settings, slides, title } = carousel;
  const layout = settings.layout || "grid";
  const columns = settings.columns || "md:grid-cols-2";
  const cardHeight = settings.cardHeight || "50vh";
  const showSubtitle = settings.showSubtitle ?? true;
  const enableHoverZoom = settings.enableHoverZoom ?? true;

  if (slides.length === 0) return null;

  const layoutClasses = {
    grid: "grid gap-0",
    collage: "grid gap-0 grid-flow-dense",
    minimal: "grid gap-8",
  };

  const columnClasses = {
    grid: columns,
    collage: columns,
    minimal: "md:grid-cols-1",
  };

  return (
    <section id="featured" className="w-full bg-white py-16 border-t-2" style={{ borderColor: primaryColor }}>
      {(title || showSubtitle) && (
        <div className="w-full px-4 md:px-12 lg:px-16 mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-2 pb-6" style={{ borderColor: primaryColor }}>
            <div>
              <span className="text-[10px] font-black tracking-[0.4em] text-neutral-400 uppercase block mb-1">
                NEW SURF BOARD
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase italic leading-none">
                {title || "CATALOGO Y SERVICIOS"}
              </h2>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 md:px-12 lg:px-16">
        <motion.div
          className={cn("grid", layoutClasses[layout], columnClasses[layout])}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {slides.map((slide) => (
            <motion.article
              key={slide.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              {slide.url && slide.url.trim() ? (
                <Link
                  href={slide.url.trim()}
                  passHref
                  legacyBehavior
                  className="relative block overflow-hidden cursor-pointer group bg-neutral-100 border border-neutral-200/40 w-full"
                  style={{ height: cardHeight }}
                >
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000"
                    style={{ backgroundImage: `url(${slide.image})` }}
                    animate={{ scale: enableHoverZoom ? 1.04 : 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />

                  {!slide.config?.hideText && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-95 group-hover:via-black/35 transition-all duration-300" />
                  )}

                  {!slide.config?.hideText && (
                    <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end z-10">
                      {showSubtitle && slide.subtitle && (
                        <motion.p className="text-xs font-black tracking-[0.35em] uppercase mb-2" style={{ color: primaryColor }}>
                          // {slide.subtitle}
                        </motion.p>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <motion.h3 className="text-white font-black text-2xl md:text-4xl tracking-tighter uppercase leading-none italic">
                          {slide.title}
                        </motion.h3>
                      </div>
                    </div>
                  )}
                </Link>
              ) : (
                <div className="relative block overflow-hidden cursor-pointer group bg-neutral-100 border border-neutral-200/40 w-full" style={{ height: cardHeight }}>
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000"
                    style={{ backgroundImage: `url(${slide.image})` }}
                    animate={{ scale: enableHoverZoom ? 1.04 : 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />

                  {!slide.config?.hideText && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-95 group-hover:via-black/35 transition-all duration-300" />
                  )}

                  {!slide.config?.hideText && (
                    <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end z-10">
                      {showSubtitle && slide.subtitle && (
                        <motion.p className="text-xs font-black tracking-[0.35em] uppercase mb-2" style={{ color: primaryColor }}>
                          // {slide.subtitle}
                        </motion.p>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <motion.h3 className="text-white font-black text-2xl md:text-4xl tracking-tighter uppercase leading-none italic">
                          {slide.title}
                        </motion.h3>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}