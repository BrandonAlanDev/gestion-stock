export interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: { hideText?: boolean };
}

export interface HeroLayoutProps {
  carousel: {
    id: string;
    settings: {
      slideLayout?: "standard" | "split" | "minimal";
      transitionDuration?: number;
      autoPlay?: boolean;
      showDots?: boolean;
      showNavButtons?: boolean;
      overlayOpacity?: number;
    };
    slides: CarouselSlide[];
  };
  primaryColor?: string;
}
