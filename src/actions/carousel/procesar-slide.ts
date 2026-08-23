import type { z } from "zod";
import { carouselWizardSlideSchema } from "@/lib/zod";
import {
  obtenerCarpetaCarrusel,
  subirImagen,
  obtenerPublicIdDesdeUrl,
} from "@/lib/services/cloudinary-service";
import { resolverEnlaceGuardado } from "@/helpers/resolverEnlaceGuardado";
import type { SlideConfig } from "@/types/carousel";

type SlideDelWizard = z.infer<typeof carouselWizardSlideSchema>;

export interface SlideProcesado {
  image: string;
  publicId?: string | null;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url: string;
  config?: SlideConfig;
  order: number;
}

export async function procesarSlide(
  slide: SlideDelWizard,
  carouselId: string
): Promise<SlideProcesado> {
  let imageUrl = slide.image;
  let publicId: string | null | undefined;
  if (imageUrl.startsWith("data:image")) {
    const subida = await subirImagen(imageUrl, obtenerCarpetaCarrusel(carouselId));
    imageUrl = subida.url;
    publicId = subida.publicId;
  } else {
    publicId = obtenerPublicIdDesdeUrl(imageUrl);
  }

  const linkType = slide.linkType && slide.linkType !== "NONE" ? slide.linkType : undefined;
  let config = slide.config;
  if (linkType) {
    config = { ...(slide.config ?? {}), linkType };
  } else if (slide.linkType === "NONE" && slide.config && "linkType" in slide.config) {
    config = Object.fromEntries(Object.entries(slide.config).filter(([clave]) => clave !== "linkType"));
  }
  const urlResuelta = resolverEnlaceGuardado(slide.linkType, slide.url);

  return {
    image: imageUrl,
    publicId,
    title: slide.title,
    subtitle: slide.subtitle,
    description: slide.description,
    ctaText: slide.ctaText,
    url: urlResuelta,
    config,
    order: slide.order,
  };
}
