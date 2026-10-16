export interface MigracionConContenido {
  nombre: string;
  contenido: string;
}

/** Detecta sentencias que eliminan datos o pueden reducir contenido almacenado. */
export function detectarMigracionesConRiesgoDeDatos(
  migraciones: readonly MigracionConContenido[],
): string[] {
  const sentenciasDeRiesgo = [
    /\bDROP\s+TABLE\b/i,
    /\bDROP\s+COLUMN\b/i,
    /\bTRUNCATE(?:\s+TABLE)?\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bMODIFY\s+(?:COLUMN\s+)?/i,
  ];

  return migraciones
    .filter(({ contenido }) => {
      const sql = contenido
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/^\s*--.*$/gm, " ")
        .replace(/^\s*#.*$/gm, " ");
      return sentenciasDeRiesgo.some((patron) => patron.test(sql));
    })
    .map(({ nombre }) => nombre)
    .sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
}

/** Exige confirmar exactamente las migraciones pendientes con riesgo de datos. */
export function validarAprobacionMigracionesDestructivas(
  confirmacion: string | undefined,
  nombresEsperados: readonly string[],
): void {
  const esperados = [...new Set(nombresEsperados)].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  const recibidos = confirmacion?.split(",").map((nombre) => nombre.trim()).filter(Boolean) ?? [];
  const coincide = recibidos.length === esperados.length &&
    recibidos.every((nombre, indice) => nombre === esperados[indice]);

  if (coincide) return;
  if (esperados.length === 0 && recibidos.length === 0) return;
  if (esperados.length === 0) {
    throw new Error("TENANT_MIGRATION_ACK_DESTRUCTIVE solo se permite si el preflight la solicita");
  }

  throw new Error(
    `Revisá el SQL y confirmá exactamente las migraciones con riesgo de datos en TENANT_MIGRATION_ACK_DESTRUCTIVE=${esperados.join(",")}`,
  );
}
