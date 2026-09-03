import { reasignarContenidoFila } from "./reasignar-contenido-fila";
import type { ClienteLectura, FilaSql, MapaIds } from "./tipos-migracion";

export async function validarReferenciasContenido(origen: ClienteLectura): Promise<void> {
  const mapas: MapaIds = new Map();
  const nombres = new Map<string, Set<string>>();
  for (const tabla of ["Category", "SubCategory", "Garment", "Carousel"]) {
    const columnas = tabla === "Category" || tabla === "SubCategory" ? "id, name" : "id";
    const filas = await origen.$queryRawUnsafe<FilaSql[]>(`SELECT ${columnas} FROM \`${tabla}\``);
    mapas.set(tabla, new Map(filas.map((fila) => [String(fila.id), String(fila.id)])));
    if (columnas.includes("name")) {
      nombres.set(tabla, new Set(filas.map((fila) => String(fila.name).trim().toLowerCase())));
    }
  }
  for (const tabla of ["PageConfig", "Grid", "Banner", "CarouselSlide", "CustomPageSections", "CustomPageItems"]) {
    const filas = await origen.$queryRawUnsafe<FilaSql[]>(`SELECT * FROM \`${tabla}\``);
    for (const fila of filas) {
      try {
        reasignarContenidoFila(tabla, fila, mapas, nombres);
      } catch (error: unknown) {
        const detalle = error instanceof Error ? error.message : "Referencia no válida.";
        throw new Error(`${tabla}, registro ${String(fila.id)}: ${detalle}`);
      }
    }
  }
}
