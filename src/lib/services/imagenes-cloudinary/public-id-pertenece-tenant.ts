import { RAICES_HISTORICAS_CLOUDINARY } from "@/lib/services/imagenes-cloudinary/raices-historicas-cloudinary";

export function publicIdPerteneceTenant(publicId: string, tenantId: string): boolean {
  const segmentos = publicId.split("/").filter(Boolean);
  if (segmentos[0] === tenantId) return true;

  const indiceTenants = segmentos.indexOf("tenants");
  if (indiceTenants === -1) {
    return RAICES_HISTORICAS_CLOUDINARY.has(segmentos[0] ?? "");
  }

  return segmentos[indiceTenants + 1] === tenantId;
}
