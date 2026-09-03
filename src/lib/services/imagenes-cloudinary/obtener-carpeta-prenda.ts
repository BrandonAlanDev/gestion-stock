import { obtenerRaizCloudinary } from "@/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";

export function obtenerCarpetaPrenda(tenantId: string, categoryId: string, garmentId: string): string {
  return `${obtenerRaizCloudinary(tenantId)}/garments/${categoryId}/${garmentId}`;
}
