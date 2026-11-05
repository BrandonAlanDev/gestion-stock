import { obtenerRaizCloudinary } from "@/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";
import { segmentoCarpeta } from "@/lib/services/imagenes-cloudinary/segmento-carpeta";

export function obtenerCarpetaCarrusel(tenantId: string, tenantNombre: string, carouselId: string, titulo: string | null | undefined): string {
  return `${obtenerRaizCloudinary(tenantId, tenantNombre)}/carruseles/${segmentoCarpeta(titulo ?? "", carouselId, "carrusel")}`;
}
