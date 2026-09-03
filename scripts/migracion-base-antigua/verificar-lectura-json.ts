import assert from "node:assert/strict";
import { leerFilasTabla } from "./leer-filas-tabla";
import type { ClienteLectura } from "./tipos-migracion";

async function verificar(): Promise<void> {
  const consultas: string[] = [];
  const filas = [{ id: "prueba", atributos: '["uno","dos"]', texto: '"escalar"' }];
  const origen = {
    $queryRawUnsafe: async (consulta: string): Promise<unknown> => {
      consultas.push(consulta);
      if (consulta.includes("INFORMATION_SCHEMA")) {
        return [
          { COLUMN_NAME: "id", DATA_TYPE: "varchar" },
          { COLUMN_NAME: "atributos", DATA_TYPE: "json" },
          { COLUMN_NAME: "texto", DATA_TYPE: "longtext" },
        ];
      }
      return filas;
    },
  } as unknown as ClienteLectura;
  assert.deepEqual(await leerFilasTabla(origen, "Prueba"), filas);
  assert.equal(consultas[1],
    "SELECT `id`,CAST(`atributos` AS CHAR) AS `atributos`,`texto` FROM `Prueba`");
  assert.ok(consultas.every((consulta) => consulta.startsWith("SELECT")));
  console.log("Lectura JSON verificada sin conexiones ni escrituras en bases de datos.");
}

void verificar().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
