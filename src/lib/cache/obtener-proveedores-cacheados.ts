import { unstable_cache } from "next/cache";
import { obtenerProveedores } from "@/lib/services/proveedores/obtener-proveedores";

export async function obtenerProveedoresCacheados(tenantId: string) {
  return unstable_cache(
    () => obtenerProveedores(tenantId),
    [`providers`],
    { revalidate: 3600, tags: [`providers`] }
  )();
}
