import { getPageConfig } from "@/actions/page-config/general.actions";
import { getCarouselSlides } from "@/actions/page-config/carousel-slides.actions";
import HomeClient from "@/components/home/HomeClient";

export default async function HomePage() {
  const pageConfig = await getPageConfig();

  // Obtenemos los slides del carrusel (caché 1 hora, tag "carousel-slides")
  const slides = await getCarouselSlides(1); // 1 = pageConfigId (único registro)

  return <HomeClient pageConfig={pageConfig} slides={slides} />;
}