// app/actions/search.ts
'use server'

// Ajusta el import de Prisma según dónde tengas tu cliente instanciado
import prisma from '@/lib/prisma'

export type SearchItem = {
  id: string;
  type: 'page' | 'category' | 'subcategory' | 'product';
  title: string;
  url: string;
  imageUrl?: string | null;
}

export async function getGlobalSearchIndex(): Promise<SearchItem[]> {
  try {
    const searchIndex: SearchItem[] = [];

    const [garments, categories, subCategories, customPages] = await Promise.all([
      prisma.garment.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          images: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { srcImage: true }
          }
        }
      }),
      prisma.category.findMany({
        where: { active: true },
        select: { id: true, name: true }
      }),
      prisma.subCategory.findMany({
        where: { active: true },
        include: {
          category: {
            select: { name: true }
          }
        }
      }),
      prisma.customPage.findMany({
        where: { isActive: true },
        select: { id: true, title: true, slug: true }
      }),
    ]);

    garments.forEach(g => {
      searchIndex.push({
        id: g.id,
        type: 'product',
        title: g.name,
        url: `/productos/item/${g.id}`,
        imageUrl: g.images.length > 0 ? g.images[0].srcImage : null 
      });
    });

    categories.forEach(c => {
      searchIndex.push({
        id: c.id,
        type: 'category',
        title: c.name,
        url: `/productos?categoria=${encodeURIComponent(c.name)}`,
      });
    });

    subCategories.forEach(s => {
      searchIndex.push({
        id: s.id,
        type: 'subcategory',
        title: s.name,
        url: `/productos?categoria=${encodeURIComponent(s.category.name)}&subcategoria=${encodeURIComponent(s.name)}`,
      });
    });

    customPages.forEach(cp => {
      searchIndex.push({
        id: cp.id,
        type: 'page',
        title: cp.title,
        url: `/page?title=${encodeURIComponent(cp.slug)}`,
      });
    });

    return searchIndex;
  } catch (error) {
    console.error("Error cargando índice de búsqueda de la base de datos:", error);
    return [];
  }
}