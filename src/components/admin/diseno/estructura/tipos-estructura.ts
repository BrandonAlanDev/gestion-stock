import type { PaginaDinamicaResumen } from "@/components/admin/diseno/contenido/tipos-contenido";

export interface SeccionPaginaEstructura {
  id: string;
  title: string | null;
  type: string;
  order: number;
}

export type PaginaDinamicaEstructura = Omit<
  PaginaDinamicaResumen,
  "secciones"
> & {
  secciones: SeccionPaginaEstructura[];
};
