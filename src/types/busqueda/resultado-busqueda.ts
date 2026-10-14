export interface ResultadoBusqueda {
  id: string;
  type: "page" | "category" | "subcategory" | "product";
  title: string;
  url: string;
  imageUrl?: string | null;
}
