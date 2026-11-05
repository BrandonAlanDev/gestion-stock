import { sufijoCarpeta } from "@/lib/services/imagenes-cloudinary/segmento-carpeta";

function esRaizNombradaDelTenant(raiz: string, tenantId: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{16}$/.test(raiz) &&
    raiz.endsWith(`-${sufijoCarpeta(tenantId)}`);
}

export function publicIdPerteneceTenant(publicId: string, tenantId: string): boolean {
  const segmentos = publicId.split("/");
  if (
    !tenantId || !/^[a-zA-Z0-9_-]+$/.test(tenantId) ||
    segmentos.length < 2 ||
    segmentos.some((segmento) => !segmento || segmento === "." || segmento === "..")
  ) return false;
  if (segmentos[0] === tenantId || esRaizNombradaDelTenant(segmentos[0], tenantId)) return true;

  // Prefijo histórico conocido; evita aceptar "tenants/{id}" en cualquier raíz.
  return segmentos[0] === "gestion-stock" &&
    segmentos[1] === "tenants" &&
    segmentos[2] === tenantId;
}

/** Solo permite subidas bajo la raíz nueva; las rutas antiguas sirven para imágenes existentes. */
export function carpetaCloudinaryPerteneceTenant(carpeta: string, tenantId: string): boolean {
  if (!tenantId || !/^[a-zA-Z0-9_-]+$/.test(tenantId)) return false;
  const segmentos = carpeta.split("/");
  return segmentos.length > 1 &&
    esRaizNombradaDelTenant(segmentos[0], tenantId) &&
    segmentos.every((segmento) => /^[a-zA-Z0-9_-]+$/.test(segmento));
}
