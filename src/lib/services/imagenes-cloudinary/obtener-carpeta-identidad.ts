import { obtenerRaizCloudinary } from "@/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";

export function obtenerCarpetaIdentidad(tenantId: string): string {
  return `${obtenerRaizCloudinary(tenantId)}/page-config/identidad`;
}
