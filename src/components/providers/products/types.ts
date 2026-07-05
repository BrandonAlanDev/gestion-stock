// components/product/types.ts
export interface ProductProps {
  product: {
    name: string;
    price: any;
    description?: string | null;
    category?: { name: string } | null;
    subCategory?: { name: string } | null;
    images?: Array<{ id: string; srcImage: string; alt?: string | null }>;
    variants?: Array<{
      stock: number;
      size?: { id: string; value: string } | null;
      color?: { id: string; name: string; hex: string | null } | null;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
}