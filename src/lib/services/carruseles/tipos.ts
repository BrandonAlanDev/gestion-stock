import type { CarouselSettings, CarouselType, SlideConfig } from "@/types/carousel";

export interface EntradaDiapositivaCarrusel {
  id?: string;
  image: string;
  publicId?: string | null;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: SlideConfig;
  order: number;
}

export interface EntradaCrearCarrusel {
  type: CarouselType;
  title?: string;
  active: boolean;
  order: number;
  settings?: CarouselSettings;
  slides: EntradaDiapositivaCarrusel[];
}

export interface EntradaActualizarCarrusel {
  id: string;
  type?: CarouselType;
  title?: string;
  active?: boolean;
  order?: number;
  settings?: CarouselSettings;
  slides?: EntradaDiapositivaCarrusel[];
}

export interface LimitesCarrusel {
  HERO: number;
  BANNER: number;
  CARDS: number;
}
