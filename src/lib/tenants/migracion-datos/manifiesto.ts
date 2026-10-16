export type ReglaSeleccionTenant =
  | { tipo: "registro-tenant"; columna: "id" }
  | { tipo: "columna-tenant"; columna: "tenantId" }
  | {
      tipo: "puente-tenant";
      columnas: readonly [
        { nombre: "variantId"; tablaPadre: "GarmentVariant" },
        { nombre: "optionValueId"; tablaPadre: "GarmentOptionValue" },
      ];
    };

export interface TablaMigracionTenant {
  modelo: string;
  tabla: string;
  seleccion: ReglaSeleccionTenant;
  dependeDe: readonly string[];
}

/**
 * Inventario explícito de los modelos comerciales del schema actual.
 * La tabla puente se copia solo cuando ambos registros padre pertenecen al tenant.
 */
export const MANIFIESTO_TABLAS_TENANT: readonly TablaMigracionTenant[] = [
  { modelo: "Tenant", tabla: "Tenant", seleccion: { tipo: "registro-tenant", columna: "id" }, dependeDe: [] },
  { modelo: "Category", tabla: "Category", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "SizeType", tabla: "SizeType", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "Color", tabla: "Color", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "Provider", tabla: "Provider", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "user", tabla: "user", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "account", tabla: "account", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "user"] },
  { modelo: "SubCategory", tabla: "SubCategory", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Category", "SizeType"] },
  { modelo: "Size", tabla: "Size", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "SizeType"] },
  { modelo: "Garment", tabla: "Garment", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Category", "SubCategory", "Provider"] },
  { modelo: "GarmentImage", tabla: "GarmentImage", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Garment"] },
  { modelo: "GarmentVariant", tabla: "GarmentVariant", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Garment", "Size", "Color"] },
  { modelo: "GarmentOption", tabla: "GarmentOption", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Garment"] },
  { modelo: "GarmentOptionValue", tabla: "GarmentOptionValue", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "GarmentOption"] },
  {
    modelo: "GarmentVariantOptionValue",
    tabla: "GarmentVariantOptionValue",
    seleccion: {
      tipo: "puente-tenant",
      columnas: [
        { nombre: "variantId", tablaPadre: "GarmentVariant" },
        { nombre: "optionValueId", tablaPadre: "GarmentOptionValue" },
      ],
    },
    dependeDe: ["GarmentVariant", "GarmentOptionValue"],
  },
  { modelo: "ContactProvider", tabla: "ContactProvider", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Provider"] },
  { modelo: "Movement", tabla: "Movement", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "GarmentVariant"] },
  { modelo: "Homegrid", tabla: "Homegrid", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "PageConfig", tabla: "PageConfig", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Homegrid"] },
  { modelo: "Banner", tabla: "Banner", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "PageConfig"] },
  { modelo: "Carousel", tabla: "Carousel", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "PageConfig"] },
  { modelo: "CarouselSlide", tabla: "CarouselSlide", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Carousel"] },
  { modelo: "Grid", tabla: "Grid", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Homegrid"] },
  { modelo: "CustomPage", tabla: "CustomPages", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "CustomSection", tabla: "CustomPageSections", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "CustomPage"] },
  { modelo: "CustomSectionItem", tabla: "CustomPageItems", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "CustomSection"] },
  { modelo: "CuentaMercadoPago", tabla: "CuentaMercadoPago", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "Pedido", tabla: "Pedido", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "user"] },
  { modelo: "PedidoItem", tabla: "PedidoItem", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Pedido", "Garment", "GarmentVariant"] },
  { modelo: "MetodoPago", tabla: "MetodoPago", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant"] },
  { modelo: "Payment", tabla: "Payment", seleccion: { tipo: "columna-tenant", columna: "tenantId" }, dependeDe: ["Tenant", "Pedido"] },
];

interface ModeloSchema {
  nombre: string;
  tabla: string;
  campos: string;
}

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

/** Valida el manifiesto contra el schema versionado antes de cualquier exportación. */
export function validarManifiestoTablasTenant(schema: string): string[] {
  const errores: string[] = [];
  const modelosSchema = extraerModelos(schema);
  const porModelo = new Map(MANIFIESTO_TABLAS_TENANT.map((tabla) => [tabla.modelo, tabla]));
  const nombresModelo = new Set<string>();
  const nombresTabla = new Set<string>();

  for (const modelo of modelosSchema) {
    if (nombresModelo.has(modelo.nombre)) errores.push(`Modelo duplicado en el schema: ${modelo.nombre}`);
    nombresModelo.add(modelo.nombre);
    const entrada = porModelo.get(modelo.nombre);
    if (!entrada) {
      errores.push(`Falta clasificar el modelo ${modelo.nombre} (${modelo.tabla})`);
      continue;
    }

    if (entrada.tabla !== modelo.tabla) {
      errores.push(`La tabla de ${modelo.nombre} cambió: manifiesto=${entrada.tabla}, schema=${modelo.tabla}`);
    }
    if (nombresTabla.has(entrada.tabla)) errores.push(`Tabla física duplicada en el manifiesto: ${entrada.tabla}`);
    nombresTabla.add(entrada.tabla);

    const tieneTenantId = /^\s*tenantId\s+\w+/m.test(modelo.campos);
    const reglaEsperada = modelo.nombre === "Tenant"
      ? "registro-tenant"
      : modelo.nombre === "GarmentVariantOptionValue"
        ? "puente-tenant"
        : "columna-tenant";
    if (entrada.seleccion.tipo !== reglaEsperada) {
      errores.push(`La regla de selección de ${modelo.nombre} no coincide con sus campos`);
    }
    if (tieneTenantId !== (entrada.seleccion.tipo === "columna-tenant")) {
      errores.push(`El campo tenantId de ${modelo.nombre} requiere revisar su regla de extracción`);
    }
  }

  for (const entrada of MANIFIESTO_TABLAS_TENANT) {
    if (!nombresModelo.has(entrada.modelo)) {
      errores.push(`El manifiesto contiene un modelo ausente del schema: ${entrada.modelo}`);
    }
  }

  const posiciones = new Map(MANIFIESTO_TABLAS_TENANT.map((tabla, indice) => [tabla.modelo, indice]));
  for (const [indice, tabla] of MANIFIESTO_TABLAS_TENANT.entries()) {
    for (const dependencia of tabla.dependeDe) {
      const posicionDependencia = posiciones.get(dependencia);
      if (posicionDependencia === undefined) {
        errores.push(`${tabla.modelo} depende de un modelo no clasificado: ${dependencia}`);
      } else if (posicionDependencia >= indice) {
        errores.push(`${dependencia} debe copiarse antes de ${tabla.modelo}`);
      }
    }
  }

  const puente = porModelo.get("GarmentVariantOptionValue")?.seleccion;
  if (
    puente?.tipo !== "puente-tenant" ||
    puente.columnas[0]?.tablaPadre !== "GarmentVariant" ||
    puente.columnas[1]?.tablaPadre !== "GarmentOptionValue"
  ) {
    errores.push("La tabla puente debe exigir pertenencia de ambos padres al mismo tenant");
  }

  return errores;
}

export interface ResultadoCoberturaTablasOrigen {
  noClasificadas: string[];
  ausentesEnOrigen: string[];
}

/** Señala tablas históricas sin regla y modelos actuales ausentes en el origen. */
export function compararTablasOrigen(
  tablasOrigen: readonly string[],
): ResultadoCoberturaTablasOrigen {
  const esperadas = new Set(MANIFIESTO_TABLAS_TENANT.map((tabla) => tabla.tabla));
  const encontradas = new Set(tablasOrigen.filter((tabla) => tabla !== "_prisma_migrations"));

  return {
    noClasificadas: [...encontradas].filter((tabla) => !esperadas.has(tabla)).sort(),
    ausentesEnOrigen: [...esperadas].filter((tabla) => !encontradas.has(tabla)).sort(),
  };
}
