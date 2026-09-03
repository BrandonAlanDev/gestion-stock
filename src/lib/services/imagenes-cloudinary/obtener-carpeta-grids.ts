import { obtenerRaizCloudinary } from "@/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";

export function obtenerCarpetaGrids(tenantId: string, homegridId: string): string {
  return `${obtenerRaizCloudinary(tenantId)}/page-config/home-grids/${homegridId}`;
}
