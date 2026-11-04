import type { ModeloVisual, VarianteVisual } from "@/lib/productos/opciones-visuales";

export interface ResultadoDisponibilidad {
  disponiblePorGrupo: Record<string, Record<string, boolean>>;
  varianteSeleccionada: VarianteVisual | null;
  stockDisponible: number;
  stockTotal: number;
  comboValido: boolean;
}

function encontrarVarianteSeleccionada(
  modelo: ModeloVisual,
  seleccion: Record<string, string>
): VarianteVisual | null {
  const seleccionCompleta = modelo.grupos.every((grupo) => (seleccion[grupo.name] ?? "") !== "");
  if (!seleccionCompleta) return null;

  return (
    modelo.variantes.find((variante) =>
      modelo.grupos.every((grupo) => variante.combinacion[grupo.name] === seleccion[grupo.name])
    ) ?? null
  );
}

export function calcularDisponibilidad(
  modelo: ModeloVisual,
  seleccion: Record<string, string>,
  controlaStock: boolean
): ResultadoDisponibilidad {
  const disponiblePorGrupo: Record<string, Record<string, boolean>> = {};

  for (const grupo of modelo.grupos) {
    disponiblePorGrupo[grupo.name] = {};
    for (const valor of grupo.values) {
      const candidato = { ...seleccion, [grupo.name]: valor.value };
      const existeConStock = modelo.variantes.some(
        (variante) =>
          (!controlaStock || variante.stock > 0) &&
          Object.entries(candidato).every(([clave, elegido]) => !elegido || variante.combinacion[clave] === elegido)
      );
      disponiblePorGrupo[grupo.name][valor.value] = existeConStock;
    }
  }

  const varianteSeleccionada = encontrarVarianteSeleccionada(modelo, seleccion);
  const stockDisponible = varianteSeleccionada?.stock ?? 0;
  const stockTotal = modelo.variantes.reduce((acumulado, variante) => acumulado + variante.stock, 0);

  let comboValido: boolean;
  if (modelo.grupos.length === 0) {
    comboValido = controlaStock
      ? varianteSeleccionada !== null && varianteSeleccionada.stock > 0
      : true;
  } else {
    comboValido = varianteSeleccionada !== null && (!controlaStock || varianteSeleccionada.stock > 0);
  }

  return { disponiblePorGrupo, varianteSeleccionada, stockDisponible, stockTotal, comboValido };
}
