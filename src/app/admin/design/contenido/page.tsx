import { getPageConfig } from "@/actions/page-config/general.actions";
import { getCustomPages } from "@/actions/custom-page.actions";
import GestorContenido from "@/components/admin/diseno/contenido/GestorContenido";
import type {
  ConfigContenido,
  PaginaDinamicaResumen,
} from "@/components/admin/diseno/contenido/tipos-contenido";

export default async function ContenidoPage() {
  const resultado = await getPageConfig();
  const pageConfig = resultado.ok ? resultado.pageConfig : null;

  let paginasDinamicas: PaginaDinamicaResumen[] = [];
  try {
    const paginas = await getCustomPages();
    paginasDinamicas = paginas.map((pagina) => ({
      id: pagina.id,
      title: pagina.title,
      slug: pagina.slug,
      isActive: pagina.isActive,
      secciones: pagina.sections.length,
    }));
  } catch {
    paginasDinamicas = [];
  }

  const config: ConfigContenido = {
    sectionOrder: pageConfig?.sectionOrder ?? null,
    homegrid: pageConfig?.homegrid
      ? {
          id: pageConfig.homegrid.id,
          title: pageConfig.homegrid.title ?? null,
          grids: pageConfig.homegrid.grids.map((grid) => ({
            id: grid.id,
            title: grid.title,
            subtitle: grid.subtitle,
            image: grid.image,
            order: grid.order,
            linkType: grid.linkType,
            linkValue: grid.linkValue,
            subtitleNeon: grid.subtitleNeon,
            subtitleDim: grid.subtitleDim,
            linkStyle: grid.linkStyle,
            buttonVariant: grid.buttonVariant,
            buttonText: grid.buttonText,
            buttonBgColor: grid.buttonBgColor,
            buttonTextColor: grid.buttonTextColor,
          })),
        }
      : null,
    featuredLayout: pageConfig?.featuredLayout ?? null,
    locationEnabled: pageConfig?.locationEnabled ?? false,
    address: pageConfig?.address ?? null,
    city: pageConfig?.city ?? null,
    province: pageConfig?.province ?? null,
    country: pageConfig?.country ?? null,
    primaryColor: pageConfig?.primaryColor ?? "#06b6d4",
    secondaryColor: pageConfig?.secondaryColor ?? "#ffffff",
  };

  return (
    <GestorContenido
      config={config}
      paginasDinamicas={paginasDinamicas}
    />
  );
}
