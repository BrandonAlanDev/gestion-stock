import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { PUENTES_MIGRACION } from "./definiciones-migracion";
import { detectarOrientacionPuente } from "./detectar-orientacion-puente";
import type { ClienteLectura } from "./tipos-migracion";

export async function guardarInformeHuerfanos(origen: ClienteLectura): Promise<number> {
  const registros: Array<{ tabla: string; A: string; B: string }> = [];
  for (const puente of PUENTES_MIGRACION) {
    const orientacion = await detectarOrientacionPuente(origen, puente, true);
    const filas = await origen.$queryRawUnsafe<Array<{ A: string; B: string }>>(
      `SELECT v.A, v.B FROM \`${puente.origen}\` v
       LEFT JOIN \`${puente.tablaRelacion}\` r ON v.\`${orientacion.relacion}\`=r.id
       LEFT JOIN \`${puente.tablaBoard}\` b ON v.\`${orientacion.board}\`=b.id
       WHERE r.id IS NULL OR b.id IS NULL`,
    );
    registros.push(...filas.map((fila) => ({ tabla: puente.origen, A: fila.A, B: fila.B })));
  }
  if (registros.length > 0) {
    const carpeta = resolve("informes-migracion");
    await mkdir(carpeta, { recursive: true });
    const archivo = resolve(carpeta, `relaciones-huerfanas-${randomUUID()}.json`);
    await writeFile(archivo, JSON.stringify({ fecha: new Date().toISOString(), registros }, null, 2), { flag: "wx" });
    console.log(`ADVERTENCIA: ${registros.length} relaciones no se copiarán. Informe: ${archivo}`);
  }
  return registros.length;
}
