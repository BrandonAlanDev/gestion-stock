import { getPageConfig } from "@/actions/page-config/general.actions";
import { getCustomPages } from "@/actions/custom-page.actions";
import EditorEstructura from "@/components/admin/diseno/estructura/EditorEstructura";
import type { PaginaDinamicaEstructura } from "@/components/admin/diseno/estructura/tipos-estructura";
import type { ConfigContenido } from "@/components/admin/diseno/contenido/tipos-contenido";

interface GridCrudo {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  order: number;
  linkType: string;
  linkValue: string | null;
  subtitleNeon: boolean;
  subtitleDim: boolean;
  linkStyle: string;
  buttonVariant: string;
  buttonText: string | null;
  buttonBgColor: string | null;
  buttonTextColor: string | null;
}

interface HomegridCrudo {
  id: string;
  title: string | null;
  active: boolean | null;
  featuredLayout: string | null;
  grids: GridCrudo[];
}

export default async function EstructuraPage() {
  const resultado = await getPageConfig();
  const pageConfig = resultado.ok ? resultado.pageConfig : null;
  const homegridsCrudos =
    (pageConfig as unknown as { homegrids?: HomegridCrudo[] } | null)
      ?.homegrids ?? [];

  let paginas: PaginaDinamicaEstructura[] = [];
  try {
    const paginasDinamicas = await getCustomPages();
    paginas = paginasDinamicas.map((pagina) => ({
      id: pagina.id,
      title: pagina.title,
      slug: pagina.slug,
      isActive: pagina.isActive,
      secciones: pagina.sections.map((seccion) => ({
        id: seccion.id,
        title: seccion.title,
        type: seccion.type,
        order: seccion.order,
      })),
    }));
  } catch {
    paginas = [];
  }

  const config: ConfigContenido = {
    sectionOrder: pageConfig?.sectionOrder ?? null,
    homegrid: pageConfig?.homegrid
      ? {
          id: pageConfig.homegrid.id,
          title: pageConfig.homegrid.title ?? null,
          active: pageConfig.homegrid.active ?? true,
          featuredLayout: pageConfig.homegrid.featuredLayout ?? null,
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
    homegrids: homegridsCrudos.map((hg) => ({
      id: hg.id,
      title: hg.title ?? null,
      active: hg.active ?? true,
      featuredLayout: hg.featuredLayout ?? null,
      grids: hg.grids.map((grid) => ({
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
    })),
    featuredLayout: pageConfig?.featuredLayout ?? null,
    locationEnabled: pageConfig?.locationEnabled ?? false,
    address: pageConfig?.address ?? null,
    city: pageConfig?.city ?? null,
    province: pageConfig?.province ?? null,
    country: pageConfig?.country ?? null,
    primaryColor: pageConfig?.primaryColor ?? "#06b6d4",
    secondaryColor: pageConfig?.secondaryColor ?? "#ffffff",
  };

  return <EditorEstructura config={config} paginas={paginas} />;
}
