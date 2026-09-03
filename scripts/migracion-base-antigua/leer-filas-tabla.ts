import type { ClienteLectura, FilaSql } from "./tipos-migracion";

export async function leerFilasTabla(
  origen: ClienteLectura,
  tabla: string,
): Promise<FilaSql[]> {
  const columnas = await origen.$queryRawUnsafe<Array<{
    COLUMN_NAME: string;
    DATA_TYPE: string;
  }>>(
    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION",
    tabla,
  );
  if (columnas.length === 0) throw new Error(`No se encontraron columnas para ${tabla}.`);
  const citar = (nombre: string): string => `\`${nombre.replace(/`/g, "``")}\``;
  const seleccion = columnas.map((columna) => {
    const nombre = citar(columna.COLUMN_NAME);
    // MySQL entrega JSON ya interpretado; conservar su representación SQL evita
    // convertir arrays en parámetros múltiples o confundir strings con JSON.
    // MariaDB lo expone como LONGTEXT, que ya se recibe sin interpretar.
    return columna.DATA_TYPE.toLowerCase() === "json"
      ? `CAST(${nombre} AS CHAR) AS ${nombre}` : nombre;
  }).join(",");
  return origen.$queryRawUnsafe<FilaSql[]>(`SELECT ${seleccion} FROM ${citar(tabla)}`);
}
