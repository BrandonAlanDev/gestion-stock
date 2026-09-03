export interface ProductoCatalogo {
  id: string;
  name: string;
  price: string | number | { toString(): string };
  createdAt: string | Date;
  images?: Array<{ srcImage: string }>;
  variants?: Array<{ stock: number }>;
}

export interface CategoriaCatalogo {
  id: string;
  name: string;
  subCategories?: Array<{ id: string; name: string }>;
}
