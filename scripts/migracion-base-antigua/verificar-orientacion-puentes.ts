import assert from "node:assert/strict";
import { detectarOrientacionPuente } from "./detectar-orientacion-puente";
import { PUENTES_MIGRACION } from "./definiciones-migracion";
import type { ClienteLectura } from "./tipos-migracion";

export async function verificarOrientacionPuentes(): Promise<void> {
  const simular = (total: number, directa: number, inversa: number): ClienteLectura => ({
    $queryRawUnsafe: async () => [{ total, directa, inversa }],
  } as unknown as ClienteLectura);
  const puente = PUENTES_MIGRACION[0];
  assert.deepEqual(await detectarOrientacionPuente(simular(3, 3, 0), puente), { board: "B", relacion: "A" });
  assert.deepEqual(await detectarOrientacionPuente(simular(3, 0, 3), puente), { board: "A", relacion: "B" });
  assert.deepEqual(await detectarOrientacionPuente(simular(0, 0, 0), puente), { board: "B", relacion: "A" });
  await assert.rejects(detectarOrientacionPuente(simular(60, 57, 0), puente));
  assert.deepEqual(await detectarOrientacionPuente(simular(60, 57, 0), puente, true), { board: "B", relacion: "A" });
  await assert.rejects(detectarOrientacionPuente(simular(3, 3, 3), puente, true));
  await assert.rejects(detectarOrientacionPuente(simular(3, 1, 1), puente, true));
  console.log("Orientaciones directas, inversas, vacías, huérfanas y ambiguas verificadas sin BD.");
}

verificarOrientacionPuentes().catch(() => {
  console.error("Falló la prueba de orientación de puentes.");
  process.exitCode = 1;
});
