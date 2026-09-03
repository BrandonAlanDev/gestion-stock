import type { ClienteLectura } from "./tipos-migracion";
import type { DefinicionPuenteMigracion } from "./definiciones-migracion";

export async function detectarOrientacionPuente(
  origen: ClienteLectura,
  puente: DefinicionPuenteMigracion,
  permitirHuerfanos = false,
): Promise<{ board: "A" | "B"; relacion: "A" | "B" }> {
  const filas = await origen.$queryRawUnsafe<Array<{
    total: bigint; directa: bigint; inversa: bigint;
  }>>(
    `SELECT COUNT(*) AS total,
      COALESCE(SUM(ra.id IS NOT NULL AND bb.id IS NOT NULL),0) AS directa,
      COALESCE(SUM(rb.id IS NOT NULL AND ba.id IS NOT NULL),0) AS inversa
     FROM \`${puente.origen}\` v
     LEFT JOIN \`${puente.tablaRelacion}\` ra ON v.A=ra.id
     LEFT JOIN \`${puente.tablaBoard}\` bb ON v.B=bb.id
     LEFT JOIN \`${puente.tablaRelacion}\` rb ON v.B=rb.id
     LEFT JOIN \`${puente.tablaBoard}\` ba ON v.A=ba.id`,
  );
  const { total, directa, inversa } = filas[0];
  if (Number(total) === 0) return { board: "B", relacion: "A" };
  if (Number(directa) === Number(total) && Number(inversa) !== Number(total)) {
    return { board: "B", relacion: "A" };
  }
  if (Number(inversa) === Number(total) && Number(directa) !== Number(total)) {
    return { board: "A", relacion: "B" };
  }
  if (permitirHuerfanos && Number(directa) > 0 && Number(inversa) === 0) {
    return { board: "B", relacion: "A" };
  }
  if (permitirHuerfanos && Number(inversa) > 0 && Number(directa) === 0) {
    return { board: "A", relacion: "B" };
  }
  throw new Error(`${puente.origen}: orientación ambigua o referencias huérfanas ` +
    `(filas=${total}, A→opción=${directa}, B→opción=${inversa}). No se omiten relaciones.`);
}
