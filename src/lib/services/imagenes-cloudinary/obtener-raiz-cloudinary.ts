import { segmentoCarpeta } from "@/lib/services/imagenes-cloudinary/segmento-carpeta";

export function obtenerRaizCloudinary(tenantId: string, tenantNombre: string): string {
  return segmentoCarpeta(tenantNombre, tenantId, "cliente");
}
