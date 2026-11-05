import { obtenerRaizCloudinary } from "@/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";
import { segmentoCarpeta } from "@/lib/services/imagenes-cloudinary/segmento-carpeta";

export function obtenerCarpetaGrids(tenantId: string, tenantNombre: string, homegridId: string, titulo: string): string {
  return `${obtenerRaizCloudinary(tenantId, tenantNombre)}/configuracion/grillas/${segmentoCarpeta(titulo, homegridId, "seccion")}`;
}
