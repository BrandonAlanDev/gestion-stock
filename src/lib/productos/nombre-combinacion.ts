interface VinculoOpcion {
  optionValue: { value: string };
}

export function nombreCombinacion(optionValues?: VinculoOpcion[] | null): string {
  if (!optionValues || optionValues.length === 0) return "";
  return optionValues.map((vinculo) => vinculo.optionValue.value).join(" / ");
}
