import { getPageConfig } from "@/actions/page-config/general.actions";
import PantallaMantenimiento from "@/components/mantenimiento/PantallaMantenimiento";

export const metadata = { title: "En mantenimiento" };

export default async function PaginaMantenimiento() {
  const { pageConfig } = await getPageConfig();

  return (
    <PantallaMantenimiento
      storeName={pageConfig?.storeName ?? "Nuestra tienda"}
      logo={
        typeof pageConfig?.logo === "string" && pageConfig.logo
          ? pageConfig.logo
          : null
      }
    />
  );
}
