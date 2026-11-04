export interface ProductoCatalogo {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subCategoryId: string | null;
  price: string | number | { toString(): string };
  createdAt: string | Date;
  updatedAt: string | Date;
  images?: Array<{ srcImage: string }>;
  variants?: Array<{ stock: number }>;
}

export interface CategoriaCatalogo {
  id: string;
  name: string;
  slug: string;
  totalProductos: number;
  subCategories: Array<{ id: string; name: string; slug: string; totalProductos: number }>;
}
