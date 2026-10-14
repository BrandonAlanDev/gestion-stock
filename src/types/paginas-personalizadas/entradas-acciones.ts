import type { Prisma } from "../../../generated/prisma/client";
import type { TipoSeccionPersonalizada } from "@/types/paginas-personalizadas";

export interface EntradaCrearPagina {
  slug: string;
  title: string;
  subtitle?: string;
  isActive?: boolean;
}

export interface EntradaActualizarPagina {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  isActive?: boolean;
}

export interface EntradaCrearSeccion {
  pageId: string;
  type: TipoSeccionPersonalizada;
  title?: string;
  subtitle?: string;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export interface EntradaActualizarSeccion {
  type?: TipoSeccionPersonalizada;
  title?: string | null;
  subtitle?: string | null;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export interface EntradaCrearElemento {
  sectionId: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  link?: string;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export interface EntradaActualizarElemento {
  title?: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  link?: string | null;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export interface EntradaActualizarContenidoPagina {
  title?: string;
  subtitle?: string;
  slug?: string;
  isActive?: boolean;
  sections: Array<{
    type: TipoSeccionPersonalizada;
    title?: string;
    subtitle?: string;
    order: number;
    config?: Prisma.InputJsonValue;
    items?: Array<{
      title: string;
      description?: string;
      image?: string;
      icon?: string;
      link?: string;
      order: number;
      config?: Prisma.InputJsonValue;
    }>;
  }>;
}
