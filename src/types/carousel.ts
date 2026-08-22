export type CarouselType = "HERO" | "BANNER" | "CARDS";

export interface CarouselLimits {
  HERO: number;
  BANNER: number;
  CARDS: number;
}

export interface CarouselSlide {
  id: string;
  carouselId: string;
  order: number;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: SlideConfig;
}

export interface SlideConfig {
  [key: string]: unknown;
}

export interface CarouselSettings {
  // HERO DEFAULT (slideLayout se aplica a todas las slides)
  heroStyle?: "DEFAULT" | "SHOWCASE";
  slideLayout?: "standard" | "split" | "minimal";
  transitionDuration?: number;
  autoPlay?: boolean;
  showDots?: boolean;
  showNavButtons?: boolean;
  overlayOpacity?: number;

  // HERO SHOWCASE
  slidesToScroll?: number;
  gap?: number;
  showArrows?: boolean;

  // BANNER / CARDS
  height?: number;

  // CARDS
  layout?: "simple" | "offers";
  hideButtons?: boolean;
  columns?: string;
  cardHeight?: string;
  showSubtitle?: boolean;
  enableHoverZoom?: boolean;

  [key: string]: unknown;
}

export interface Carousel {
  id: string;
  type: CarouselType;
  title?: string;
  active: boolean;
  order: number;
  pageConfigId: number;
  settings?: CarouselSettings;
  slides?: CarouselSlide[];
}

// Wizard types
export interface SlideWizardData {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  url: string;
  linkType?: string;
  order: number;
  isNew?: boolean;
  config?: Record<string, unknown>;
}

export interface CarouselWizardData {
  id?: string;
  type: CarouselType;
  title: string;
  settings: CarouselSettings;
  slides: SlideWizardData[];
}