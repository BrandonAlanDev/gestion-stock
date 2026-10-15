import { obtenerConfiguracionPaginaSolicitud } from "@/lib/configuracion-pagina/obtener-configuracion-pagina-solicitud";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const [{ categoria }, tenant, { pageConfig }] = await Promise.all([
    params,
    obtenerTenantPublico(),
    obtenerConfiguracionPaginaSolicitud(),
  ]);
  const nombre = decodeURIComponent(categoria);
  const nombreTienda = pageConfig?.storeName ?? tenant?.nombre ?? "Tienda";
  return {
    title: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)} — ${nombreTienda}`,
  };
}
