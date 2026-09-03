export interface OfferItem {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: number;
  buttonText?: string;
  href?: string;
  hideButton?: boolean;
}

export interface OfferCarouselProps {
  title?: string;
  subtitle?: string;
  items: OfferItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
}
