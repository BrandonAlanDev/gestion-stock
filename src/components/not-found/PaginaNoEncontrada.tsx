import { getPageConfig } from "@/actions/page-config/general.actions";
import NotFoundClient from "@/components/not-found/NotFoundClient";

export default async function PaginaNoEncontrada() {
  const { pageConfig } = await getPageConfig();

  const config = (pageConfig || {}) as Record<string, unknown>;

  const primaryColor =
    typeof config.primaryColor === "string" && config.primaryColor.length > 0
      ? config.primaryColor
      : "#0f766e";

  const secondaryColor =
    typeof config.secondaryColor === "string" && config.secondaryColor.length > 0
      ? config.secondaryColor
      : "#f0fdfa";

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
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      storeName={storeName}
      logo={logo}
    />
  );
}
