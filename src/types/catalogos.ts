import type { getCategoriesFull } from "@/lib/services/category-service";
import type { getSizeTypes } from "@/lib/services/size-service";

export type CategoriaConSubs = Awaited<ReturnType<typeof getCategoriesFull>>[number];
export type SubcategoriaConTalle = CategoriaConSubs["subCategories"][number];
export type TalleTipoConSizes = Awaited<ReturnType<typeof getSizeTypes>>[number];
