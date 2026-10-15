import type { obtenerCategoriasCompletas } from "@/lib/services/categorias/obtener-categorias-completas";
import type { getSizeTypes } from "@/lib/services/size-service";

export type CategoriaConSubs = Awaited<ReturnType<typeof obtenerCategoriasCompletas>>[number];
export type SubcategoriaConTalle = CategoriaConSubs["subCategories"][number];
export type TalleTipoConSizes = Awaited<ReturnType<typeof getSizeTypes>>[number];
