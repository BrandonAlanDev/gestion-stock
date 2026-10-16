import { MANIFIESTO_TABLAS_TENANT } from "./manifiesto";

export interface RelacionForaneaTenant {
  tablaHija: string;
  columnaHija: string;
  tablaPadre: string;
  columnaPadre: string;
  origen: "prisma" | "tenant" | "legado";
}

interface ModeloSchema {
  nombre: string;
  tabla: string;
  campos: string;
}

const RELACIONES_LEGADAS: readonly RelacionForaneaTenant[] = [
  {
    tablaHija: "PedidoItem",
    columnaHija: "garmentId",
    tablaPadre: "Garment",
    columnaPadre: "id",
    origen: "legado",
  },
  {
    tablaHija: "PedidoItem",
    columnaHija: "variantId",
    tablaPadre: "GarmentVariant",
    columnaPadre: "id",
    origen: "legado",
  },
];

function extraerModelos(schema: string): ModeloSchema[] {
  const modelos: ModeloSchema[] = [];
  const expresion = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm;
  for (const coincidencia of schema.matchAll(expresion)) {
    const nombre = coincidencia[1];
    const campos = coincidencia[2];
    if (!nombre || campos === undefined) continue;
    const tabla = campos.match(/^\s*@@map\("([^"]+)"\)/m)?.[1] ?? nombre;
    modelos.push({ nombre, tabla, campos });
  }
  return modelos;
}

function extraerRelacionesDeclaradas(modelo: ModeloSchema): RelacionForaneaTenant[] {
  const relaciones: RelacionForaneaTenant[] = [];
  const expresion = /^\s*\w+\s+(\w+)\??\s+@relation\(([\s\S]*?)\)/gm;

  for (const coincidencia of modelo.campos.matchAll(expresion)) {
    const modeloPadre = coincidencia[1];
    const argumentos = coincidencia[2];
    if (!modeloPadre || argumentos === undefined) continue;
    const camposLocales = argumentos.match(/\bfields:\s*\[([^\]]+)\]/)?.[1];
    const camposPadre = argumentos.match(/\breferences:\s*\[([^\]]+)\]/)?.[1];
    if (camposLocales === undefined || camposPadre === undefined) continue;

    const locales = camposLocales.split(",").map((campo) => campo.trim()).filter(Boolean);
    const padres = camposPadre.split(",").map((campo) => campo.trim()).filter(Boolean);
    if (locales.length !== padres.length) continue;

    locales.forEach((columnaHija, indice) => {
      const columnaPadre = padres[indice];
      if (!columnaPadre) return;
      relaciones.push({
        tablaHija: modelo.tabla,
        columnaHija,
        tablaPadre: modeloPadre,
        columnaPadre,
        origen: "prisma",
      });
    });
  }

  return relaciones;
}

/** Devuelve las referencias del schema más las que el modelo legado omite. */
export function obtenerRelacionesForaneasTenant(schema: string): RelacionForaneaTenant[] {
  const modelos = extraerModelos(schema);
  const tablasPorModelo = new Map(
    MANIFIESTO_TABLAS_TENANT.map((entrada) => [entrada.modelo, entrada.tabla]),
  );
  const relaciones: RelacionForaneaTenant[] = [];

  for (const modelo of modelos) {
    if (!tablasPorModelo.has(modelo.nombre)) continue;
    for (const relacion of extraerRelacionesDeclaradas(modelo)) {
      const tablaPadre = tablasPorModelo.get(relacion.tablaPadre);
      if (!tablaPadre) continue;
      relaciones.push({ ...relacion, tablaPadre });
    }
  }

  const tenantTable = tablasPorModelo.get("Tenant");
  if (tenantTable) {
    for (const entrada of MANIFIESTO_TABLAS_TENANT) {
      if (entrada.seleccion.tipo !== "columna-tenant") continue;
      const yaDeclarada = relaciones.some((relacion) =>
        relacion.tablaHija === entrada.tabla &&
        relacion.columnaHija === "tenantId" &&
        relacion.tablaPadre === tenantTable &&
        relacion.columnaPadre === "id",
      );
      if (!yaDeclarada) {
        relaciones.push({
          tablaHija: entrada.tabla,
          columnaHija: "tenantId",
          tablaPadre: tenantTable,
          columnaPadre: "id",
          origen: "tenant",
        });
      }
    }
  }

  for (const relacion of RELACIONES_LEGADAS) {
    const tablaHija = tablasPorModelo.get("PedidoItem");
    const tablaPadre = tablasPorModelo.get(relacion.tablaPadre);
    if (tablaHija && tablaPadre) {
      relaciones.push({ ...relacion, tablaHija, tablaPadre });
    }
  }

  const unicas = new Map<string, RelacionForaneaTenant>();
  for (const relacion of relaciones) {
    const clave = [
      relacion.tablaHija,
      relacion.columnaHija,
      relacion.tablaPadre,
      relacion.columnaPadre,
    ].join(".");
    if (!unicas.has(clave)) unicas.set(clave, relacion);
  }
  return [...unicas.values()];
}

/** Detecta referencias del schema que el orden de extracción no contempla. */
export function validarRelacionesForaneasTenant(schema: string): string[] {
  const errores: string[] = [];
  const modelos = extraerModelos(schema);
  const manifiestoPorTabla = new Map(
    MANIFIESTO_TABLAS_TENANT.map((entrada) => [entrada.tabla, entrada]),
  );
  const modelosPorTabla = new Map(modelos.map((modelo) => [modelo.tabla, modelo]));
  const modelosPorNombre = new Map(modelos.map((modelo) => [modelo.nombre, modelo]));
  const manifiestoPorModelo = new Map(
    MANIFIESTO_TABLAS_TENANT.map((entrada) => [entrada.modelo, entrada]),
  );

  for (const modelo of modelos) {
    const entradaHija = manifiestoPorModelo.get(modelo.nombre);
    if (!entradaHija) continue;
    for (const relacion of extraerRelacionesDeclaradas(modelo)) {
      const entradaPadre = manifiestoPorModelo.get(relacion.tablaPadre);
      if (!entradaPadre || !modelosPorNombre.has(relacion.tablaPadre)) {
        errores.push(`${modelo.nombre} referencia un modelo no clasificado: ${relacion.tablaPadre}`);
        continue;
      }
    }
  }

  for (const relacion of obtenerRelacionesForaneasTenant(schema)) {
    const entradaHija = manifiestoPorTabla.get(relacion.tablaHija);
    const entradaPadre = manifiestoPorTabla.get(relacion.tablaPadre);
    const modeloHijo = modelosPorTabla.get(relacion.tablaHija);
    const modeloPadre = modelosPorTabla.get(relacion.tablaPadre);
    if (!entradaHija || !entradaPadre || !modeloHijo || !modeloPadre) {
      errores.push(
        `${relacion.tablaHija}.${relacion.columnaHija} referencia una tabla sin clasificar: ${relacion.tablaPadre}`,
      );
      continue;
    }
    if (entradaHija.modelo !== entradaPadre.modelo && !entradaHija.dependeDe.includes(entradaPadre.modelo)) {
      errores.push(`${entradaHija.modelo} debe depender de ${entradaPadre.modelo} para copiarse`);
    }
    if (!new RegExp(`^\\s*${relacion.columnaHija}\\s+\\w+`, "m").test(modeloHijo.campos)) {
      errores.push(`${entradaHija.modelo}.${relacion.columnaHija} no existe en el schema`);
    }
    if (!new RegExp(`^\\s*${relacion.columnaPadre}\\s+\\w+`, "m").test(modeloPadre.campos)) {
      errores.push(`${entradaPadre.modelo}.${relacion.columnaPadre} no existe en el schema`);
    }
  }

  return errores;
}
