import { obtenerRaizCloudinary } from "@/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";

export function obtenerCarpetaCarrusel(tenantId: string, carouselId: string): string {
  return `${obtenerRaizCloudinary(tenantId)}/carousels/${carouselId}`;
}
