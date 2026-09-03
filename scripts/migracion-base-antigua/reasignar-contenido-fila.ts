import { reasignarEnlaceContenido } from "./reasignar-enlace-contenido";
import type { FilaSql, MapaIds } from "./tipos-migracion";

export function reasignarContenidoFila(
  tabla: string,
  fila: FilaSql,
  mapas: MapaIds,
  nombres: ReadonlyMap<string, ReadonlySet<string>> = new Map(),
): FilaSql {
  const cambios: FilaSql = {};
  const cambiarEnlace = (columna: string, tipo?: string): void => {
    const anterior = fila[columna];
    if (typeof anterior !== "string") return;
    const nuevo = reasignarEnlaceContenido(anterior, mapas, tipo, nombres);
    if (nuevo !== anterior) cambios[columna] = nuevo;
  };
  if (tabla === "PageConfig" && typeof fila.sectionOrder === "string") {
    const secciones: unknown = JSON.parse(fila.sectionOrder);
    if (!Array.isArray(secciones) || !secciones.every((valor) => typeof valor === "string")) {
      throw new Error("PageConfig.sectionOrder debe ser una lista de nombres de sección.");
    }
    const nuevas = secciones.map((seccion: string) => {
      if (!seccion.startsWith("carousel_")) return seccion;
      const nuevo = mapas.get("Carousel")?.get(seccion.slice("carousel_".length));
      if (nuevo === undefined) throw new Error("PageConfig.sectionOrder referencia un carrusel inexistente.");
      return `carousel_${nuevo}`;
    });
    if (nuevas.some((valor, indice) => valor !== secciones[indice])) {
      cambios.sectionOrder = JSON.stringify(nuevas);
    }
  }
  if (tabla === "Grid") cambiarEnlace("linkValue", String(fila.linkType ?? ""));
  if (tabla === "Banner") cambiarEnlace("url");
  if (tabla === "CustomPageItems") cambiarEnlace("link");
  if (["CarouselSlide", "CustomPageSections", "CustomPageItems"].includes(tabla)) {
    const configuracion: unknown = typeof fila.config === "string" ? JSON.parse(fila.config) : fila.config;
    if (tabla === "CarouselSlide") {
      const tipo = esRegistro(configuracion) && typeof configuracion.linkType === "string"
        ? configuracion.linkType : undefined;
      cambiarEnlace("url", tipo);
    }
    if (esRegistro(configuracion)) {
      const nueva = { ...configuracion };
      for (const clave of ["buttonLink"]) {
        const valor = configuracion[clave];
        if (typeof valor === "string") nueva[clave] = reasignarEnlaceContenido(valor, mapas, undefined, nombres);
      }
      if (JSON.stringify(nueva) !== JSON.stringify(configuracion)) cambios.config = JSON.stringify(nueva);
    }
  }
  return cambios;
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
