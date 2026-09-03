export interface FilaWidgetPersonalizado {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface WidgetPersonalizado {
  overline?: string;
  title?: string;
  rows?: FilaWidgetPersonalizado[];
}

export interface ConfiguracionSeccionPersonalizada {
  alert?: string;
  buttonLink?: string;
  buttonText?: string;
  description?: string;
  overline?: string;
  stepNumber?: string;
  style?: string;
  widget?: WidgetPersonalizado;
  [clave: string]: unknown;
}

export interface ItemPaginaPersonalizada {
  [clave: string]: unknown;
  id?: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  link?: string | null;
  order?: number;
  config?: ConfiguracionSeccionPersonalizada | null;
  configStr?: string;
}

export type TipoSeccionPersonalizada =
  | "HERO"
  | "TEXT"
  | "CARDS"
  | "FAQ"
  | "TIMELINE"
  | "CTA"
  | "GALLERY"
  | "FEATURES";

export interface SeccionPaginaPersonalizada {
  [clave: string]: unknown;
  id?: string;
  type: TipoSeccionPersonalizada;
  title?: string | null;
  subtitle?: string | null;
  order?: number;
  config?: ConfiguracionSeccionPersonalizada | null;
  configStr?: string;
  items: ItemPaginaPersonalizada[];
}

export interface PaginaPersonalizada {
  [clave: string]: unknown;
  id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  isActive?: boolean;
  sections: SeccionPaginaPersonalizada[];
}

export interface PaginaVistaPersonalizada {
  slug: string;
  title: string;
  subtitle?: string | null;
  sections: Array<{
    id?: string;
    type: string;
    title?: string | null;
    subtitle?: string | null;
    items: Array<{
      id?: string;
      title: string;
      description?: string | null;
      icon?: string | null;
    }>;
  }>;
}

export type ValorCampoPaginaPersonalizada = string | number | boolean | null;
