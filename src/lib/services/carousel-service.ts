import { prisma } from "@/lib/prisma";
import type { CarouselType, CarouselSettings, SlideConfig } from "@/types/carousel";

export interface CarouselSlideInput {
  id?: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: SlideConfig;
  order: number;
}

export interface CarouselCreateInput {
  type: CarouselType;
  title?: string;
  active: boolean;
  order: number;
  settings?: CarouselSettings;
  slides: CarouselSlideInput[];
}

export interface CarouselUpdateInput {
  id: string;
  type?: CarouselType;
  title?: string;
  active?: boolean;
  order?: number;
  settings?: CarouselSettings;
  slides?: CarouselSlideInput[];
}

export interface CarouselLimits {
  HERO: number;
  BANNER: number;
  CARDS: number;
}

const STATIC_LIMITS: CarouselLimits = { HERO: 10, BANNER: 10, CARDS: 10 };

export async function getCarouselLimits(): Promise<CarouselLimits> {
  return { ...STATIC_LIMITS };
}

export async function countActiveCarouselsByType(): Promise<Record<CarouselType, number>> {
  const carousels = await prisma.carousel.findMany({
    where: { pageConfigId: 1, active: true },
    select: { type: true },
  });

  const counts = { HERO: 0, BANNER: 0, CARDS: 0 } as Record<CarouselType, number>;
  for (const c of carousels) {
    counts[c.type]++;
  }
  return counts;
}

export async function getCarousels(
  type?: CarouselType,
  activeOnly = true
) {
  const where: Record<string, unknown> = { pageConfigId: 1 };
  if (activeOnly) where.active = true;
  if (type) where.type = type;

  return prisma.carousel.findMany({
    where,
    include: { slides: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}

export async function getCarouselById(id: string) {
  return prisma.carousel.findUnique({
    where: { id },
    include: { slides: { orderBy: { order: "asc" } } },
  });
}

export async function getMaxOrder(): Promise<number | null> {
  const result = await prisma.carousel.aggregate({
    _max: { order: true },
  });
  return result._max.order;
}

export async function createCarousel(data: CarouselCreateInput) {
  return prisma.$transaction(async (tx) => {
    const carousel = await tx.carousel.create({
      data: {
        ...data,
        pageConfigId: 1,
        slides: { create: data.slides },
      },
      include: { slides: { orderBy: { order: "asc" } } },
    });
    return carousel;
  });
}

export async function updateCarousel(data: CarouselUpdateInput) {
  const { id, slides, ...carouselData } = data;

  return prisma.$transaction(async (tx) => {
    if (Object.keys(carouselData).length > 0) {
      await tx.carousel.update({
        where: { id },
        data: carouselData,
      });
    }

    if (slides) {
      // Eliminar todos los slides existentes para evitar conflictos de unique constraint al reordenar
      await tx.carouselSlide.deleteMany({ where: { carouselId: id } });

      // Crear todos los slides con los nuevos órdenes
      await tx.carouselSlide.createMany({
        data: slides.map((slide) => ({
          carouselId: id,
          image: slide.image,
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          ctaText: slide.ctaText,
          url: slide.url,
          config: slide.config,
          order: slide.order,
        })),
      });
    }

    return tx.carousel.findUnique({
      where: { id },
      include: { slides: { orderBy: { order: "asc" } } },
    });
  });
}

export async function deleteCarousel(id: string) {
  return prisma.carousel.delete({ where: { id } });
}

export async function reorderCarousels(ids: string[]) {
  return prisma.$transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx.carousel.update({ where: { id: ids[i] }, data: { order: 1000 + i } });
    }
    for (let i = 0; i < ids.length; i++) {
      await tx.carousel.update({ where: { id: ids[i] }, data: { order: i } });
    }
  });
}

export async function createSlide(data: CarouselSlideInput & { carouselId: string }) {
  return prisma.carouselSlide.create({ data });
}

export async function updateSlide(data: CarouselSlideInput & { id: string }) {
  const { id, ...rest } = data;
  return prisma.carouselSlide.update({ where: { id }, data: rest });
}

export async function deleteSlide(id: string) {
  return prisma.carouselSlide.delete({ where: { id } });
}

export async function getSlideById(id: string) {
  return prisma.carouselSlide.findUnique({ where: { id } });
}

export async function getSlidesByCarouselId(carouselId: string) {
  return prisma.carouselSlide.findMany({
    where: { carouselId },
    orderBy: { order: "asc" },
  });
}

export async function updateSlideOrder(id: string, order: number) {
  return prisma.carouselSlide.update({ where: { id }, data: { order } });
}