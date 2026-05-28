import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Caché para la configuración general (único registro)
export const getCachedPageConfig = unstable_cache(
  async () => {
    return prisma.pageConfig.findUnique({ where: { id: "1" } });
  },
  ['page-config'],
  { revalidate: 3600 } // 1 hora
);

// Caché para productos paginados – esta función RETORNA una función cacheada
export const getCachedProducts = (page: number, limit: number, categoryId?: string) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit;
      const where = categoryId ? { categoryId, active: true } : { active: true };

      const [garments, total] = await Promise.all([
        prisma.garment.findMany({
          where,
          include: {
            images: { take: 1, orderBy: { order: 'asc' } },
            variants: {
              include: { size: true, color: true },
              take: 5,
            },
            subCategory: true,
            category: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.garment.count({ where }),
      ]);

      return { garments, total };
    },
    [`products-pg-${page}-lim-${limit}-cat-${categoryId || 'all'}`],
    { revalidate: 60 } // 60 segundos – ajustá según necesidad
  );