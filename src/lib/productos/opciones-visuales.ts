export interface GrupoVisual {
  name: string;
  values: Array<{ id: string; value: string }>;
}

export interface VarianteVisual {
  id: string;
  stock: number;
  sku: string | null;
  priceOverride: number | null;
  combinacion: Record<string, string>;
}

interface ProductoConOpciones {
  opciones?: Array<{ name: string; values?: Array<{ id?: string; value: string }> }> | null;
  variants?: Array<{
    id: string;
    stock: number;
    sku?: string | null;
    priceOverride?: number | string | { toString(): string } | null;
    optionValues?: Array<{ optionValue: { value: string; option: { name: string } } }>;
  }>;
}

export interface ModeloVisual {
  grupos: GrupoVisual[];
  variantes: VarianteVisual[];
}

export function construirModeloVisual(producto: ProductoConOpciones): ModeloVisual {
  const grupos: GrupoVisual[] = [];
  for (const opcion of producto.opciones ?? []) {
    grupos.push({
      name: opcion.name,
      values: (opcion.values ?? []).map((valor) => ({ id: valor.value, value: valor.value })),
    });
  }

  const variantes = (producto.variants ?? []).map((variante) => {
    const combinacion: Record<string, string> = {};
    for (const vinculo of variante.optionValues ?? []) {
      combinacion[vinculo.optionValue.option.name] = vinculo.optionValue.value;
    }
    return {
      id: variante.id,
      stock: variante.stock,
      sku: variante.sku ?? null,
      priceOverride: variante.priceOverride != null ? Number(variante.priceOverride) : null,
      combinacion,
    };
  });

  if (grupos.length === 0) {
    const nombres = new Set<string>();
    for (const variante of variantes) {
      Object.keys(variante.combinacion).forEach((nombre) => nombres.add(nombre));
    }
    for (const nombre of Array.from(nombres)) {
      const valores = Array.from(new Map(
        variantes.map((v) => v.combinacion[nombre]).filter(Boolean).map((valor) => [valor as string, valor as string])
      ).values());
      grupos.push({ name: nombre, values: valores.map((valor) => ({ id: valor, value: valor })) });
    }
  }

  return { grupos, variantes };
}

export function precioDeVariante(precioGeneral: number, variante: VarianteVisual): number {
  return variante.priceOverride ?? precioGeneral;
}

export function varianteCompleta(modelo: ModeloVisual, seleccion: Record<string, string>) {
  const claves = Object.keys(seleccion);
  if (claves.length === 0) return null;
  return modelo.variantes.find((v) => claves.every((clave) => v.combinacion[clave] === seleccion[clave])) ?? null;
}
