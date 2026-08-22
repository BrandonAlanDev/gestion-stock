// src/lib/services/carousel-service.ts
import prisma from "@/lib/prisma";

export async function getBannersByPageConfig(pageConfigId: number) {
  return prisma.banner.findMany({
    where: { pageConfigId, active: true },
    orderBy: { order: "asc" },
  });
}

export async function createBanner(data: {
  pageConfigId: number;
  image: string;
  title?: string;
  subtitle?: string;
  text?: string;
  url?: string;
  order?: number;
}) {
  const { pageConfigId, order, ...rest } = data;

  let bannerOrder = order;

  if (bannerOrder === undefined) {
    const last = await prisma.banner.findFirst({
      where: { pageConfigId },
      orderBy: { order: "desc" },
    });

    bannerOrder = last ? last.order + 1 : 0;
  }

  return prisma.banner.create({
    data: {
      ...rest,
      pageConfigId,
      order: bannerOrder,
    },
  });
}

export async function updateBanner(id: number, data: {
  image?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  url?: string;
  active?: boolean;
}) {
  return prisma.banner.update({
    where: { id },
    data,
  });
}

export async function deleteBanner(id: number) {
  // Eliminar y luego reordenar los que quedaban
  const deleted = await prisma.banner.delete({ where: { id } });
  // Reordenar los restantes para que no queden huecos en order
  const banners = await prisma.banner.findMany({
    where: { pageConfigId: deleted.pageConfigId },
    orderBy: { order: "asc" },
  });
  for (let i = 0; i < banners.length; i++) {
    await prisma.banner.update({
      where: { id: banners[i].id },
      data: { order: i },
    });
  }
  return deleted;
}

export async function reorderBanners(pageConfigId: number, orderedIds: number[]) {
  // orderedIds contiene los IDs en el nuevo orden
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.banner.update({
        where: { id },
        data: { order: index },
      })
    )
  );
}