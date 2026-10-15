import type { CarouselType } from "@/types/carousel";

export const TIPOS_CARRUSEL_ADMITIDOS = ["HERO", "BANNER", "CARDS"] as const satisfies readonly CarouselType[];
