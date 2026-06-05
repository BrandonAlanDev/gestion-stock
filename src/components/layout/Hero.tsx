"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { heroSlides } from "@/components/data/data";
import Carousel from "@/components/ui/carousel";

const Hero = () => {
  const { pageConfig } = usePageConfig();

  const slidesData = useMemo(() => {
    // Slide dinámico construido con la configuración del sitio
    const slideDinamico = {
      id: "store-main",
      title: pageConfig?.storeName || "MYA SPORTS",
      subtitle: pageConfig?.slogan || "⚡ CULTURA DEPORTIVA Y URBANA",
      description: pageConfig?.description || "...",
      images: [
        pageConfig?.banner ||
          "https://images.unsplash.com/photo-1579952365116-7a5ed211daef?q=80&w=2000&auto=format&fit=crop",
      ],
      ctaText: "EXPLORAR DROP",
      targetCategory: null,
    };
    return [slideDinamico, ...heroSlides];
  }, [pageConfig]);

  const carouselSlides = useMemo(
    () =>
      slidesData.map((slide) => ({
        id: slide.id,
        content: (
          // Este div ocupa el 100% del slide (que ahora tiene altura definida)
          <div className="relative w-full h-full">
            <Image
              src={slide.images[0]}
              alt={slide.title}
              fill
              className="object-cover"
              draggable={false}
              priority
            />
            {/* Gradientes decorativos sobre la imagen */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          </div>
        ),
      })),
    [slidesData]
  );

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black text-white">
      <div className="mt-[5rem] h-full select-none">
        <Carousel
          slides={carouselSlides}
          height="100%"
          slideWidth="0 0 33.333333%"
          gap="0.5rem"
          autoplayDelay={2000}
          loop={true}
          showArrows={true}
          slidesToScroll={1}
          showDots={false}
          arrowClassName="bg-white/10 border border-white/20 hover:bg-white/20"
        />
      </div>
    </div>
  );
};

export default Hero;