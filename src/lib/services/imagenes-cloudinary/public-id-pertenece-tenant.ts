export function publicIdPerteneceTenant(publicId: string, tenantId: string): boolean {
  const segmentos = publicId.split("/");
  if (
    !tenantId ||
    segmentos.length === 0 ||
    segmentos.some((segmento) => !segmento || segmento === "." || segmento === "..")
  ) return false;
  if (segmentos[0] === tenantId) return true;

  // Prefijo histórico conocido; evita aceptar "tenants/{id}" en cualquier raíz.
  return segmentos[0] === "gestion-stock" &&
    segmentos[1] === "tenants" &&
    segmentos[2] === tenantId;
}

/** Valida carpetas nuevas bajo la raíz propia del tenant. */
export function carpetaCloudinaryPerteneceTenant(carpeta: string, tenantId: string): boolean {
  if (!tenantId || !/^[a-zA-Z0-9_-]+$/.test(tenantId)) return false;
  const segmentos = carpeta.split("/");
  return segmentos.length > 0 &&
    segmentos[0] === tenantId &&
    segmentos.every((segmento) => /^[a-zA-Z0-9_-]+$/.test(segmento));
}
