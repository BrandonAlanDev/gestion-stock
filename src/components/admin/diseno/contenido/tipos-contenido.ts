export interface GridContenido {
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

export interface HomegridContenido {
  id: string;
  title: string | null;
  active: boolean;
  featuredLayout: string | null;
  grids: GridContenido[];
}

export interface ConfigContenido {
  sectionOrder: string | null;
  homegrid: HomegridContenido | null;
  homegrids: HomegridContenido[];
  featuredLayout: string | null;
  locationEnabled: boolean;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export interface PaginaDinamicaResumen {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
  secciones: number;
}
