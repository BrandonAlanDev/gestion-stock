import NotFoundClient from "@/components/not-found/NotFoundClient";
import { obtenerConfiguracionPaginaSolicitud } from "@/lib/configuracion-pagina/obtener-configuracion-pagina-solicitud";

export default async function PaginaNoEncontrada() {
  const { pageConfig } = await obtenerConfiguracionPaginaSolicitud();

  const config = (pageConfig || {}) as Record<string, unknown>;

  const storeName =
    typeof config.storeName === "string" && config.storeName.length > 0
      ? config.storeName
      : "Nuestra Tienda";

  const logo =
    typeof config.logo === "string" && config.logo.length > 0
      ? config.logo
      : null;

  return (
    <NotFoundClient
      storeName={storeName}
      logo={logo}
    />
  );
}
