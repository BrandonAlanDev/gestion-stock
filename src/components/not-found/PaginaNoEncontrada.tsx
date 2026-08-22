import { getPageConfig } from "@/actions/page-config/general.actions";
import NotFoundClient from "@/components/not-found/NotFoundClient";

export default async function PaginaNoEncontrada() {
  const { pageConfig } = await getPageConfig();

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
