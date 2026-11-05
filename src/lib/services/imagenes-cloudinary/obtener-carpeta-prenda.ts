import { obtenerRaizCloudinary } from "@/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";
import { segmentoCarpeta } from "@/lib/services/imagenes-cloudinary/segmento-carpeta";

export function obtenerCarpetaPrenda(
  tenantId: string,
  tenantNombre: string,
  categoryId: string,
  categoryName: string,
  garmentId: string,
  garmentName: string,
): string {
  return `${obtenerRaizCloudinary(tenantId, tenantNombre)}/productos/${segmentoCarpeta(categoryName, categoryId, "categoria")}/${segmentoCarpeta(garmentName, garmentId, "producto")}`;
}
