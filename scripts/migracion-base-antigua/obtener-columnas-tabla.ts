import type { ClienteLectura } from "./tipos-migracion";

type FilaColumna = { COLUMN_NAME: string };

export async function obtenerColumnasTabla(
  cliente: ClienteLectura,
  baseDatos: string,
  tabla: string,
): Promise<Set<string>> {
  const filas = await cliente.$queryRawUnsafe<FilaColumna[]>(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",
    baseDatos,
    tabla,
  );
  return new Set(filas.map((fila) => fila.COLUMN_NAME));
}
