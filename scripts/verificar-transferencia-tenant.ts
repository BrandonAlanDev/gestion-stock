import assert from "node:assert/strict";
import { Prisma } from "../generated/prisma/client";
import { MANIFIESTO_TABLAS_TENANT } from "../src/lib/tenants/migracion-datos/manifiesto";
import {
  copiarDatos,
  verificarCopia,
} from "./tenants/transferencia/copia";
import {
  type ClienteTransferencia,
  type DelegadoTransferencia,
  CAMPOS_JSON,
  construirWhere,
  ordenPrimario,
} from "./tenants/transferencia/datos";

const TENANT_A = "tenant-transferencia-a";
const TENANT_B = "tenant-transferencia-b";

const TENANT_ORIGEN = {
  id: TENANT_A,
  nombre: "Tienda del origen",
  slug: "tienda-origen",
  dominio: "origen.example.com",
  estado: "ACTIVO",
  createdAt: new Date("2024-01-02T03:04:05.000Z"),
  updatedAt: new Date("2025-06-07T08:09:10.000Z"),
};

const TENANT_DESTINO_INICIAL = {
  id: TENANT_A,
  nombre: "Tenant pendiente",
  slug: "tenant-pendiente",
  dominio: null,
  estado: "ACTIVO",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

type FilasPorModelo = Record<string, Array<Record<string, unknown>>>;

interface ConsultaRegistrada {
  modelo: string;
  where: Record<string, unknown>;
  orderBy: Record<string, "asc">;
  take: number;
  skip: number;
}

interface ClienteFalsoTransferencia {
  cliente: ClienteTransferencia;
  obtenerTenant(): Record<string, unknown>;
  obtenerFilas(modelo: string): Array<Record<string, unknown>>;
  obtenerConsultas(): ConsultaRegistrada[];
  obtenerLotes(modelo: string): Array<Array<Record<string, unknown>>>;
}

function clonarFilas(filas: readonly Record<string, unknown>[]): Array<Record<string, unknown>> {
  return filas.map((fila) => ({ ...fila }));
}

function crearClienteFalso(
  tenantInicial: Record<string, unknown>,
  filasIniciales: FilasPorModelo = {},
  tiposJsonIniciales: Record<string, string | null> = {},
): ClienteFalsoTransferencia {
  let tenant = { ...tenantInicial };
  const filasPorModelo = new Map<string, Array<Record<string, unknown>>>(
    Object.entries(filasIniciales).map(([modelo, filas]) => [modelo, clonarFilas(filas)]),
  );
  const consultas: ConsultaRegistrada[] = [];
  const lotesPorModelo = new Map<string, Array<Array<Record<string, unknown>>>>();
  const tiposJson = new Map(Object.entries(tiposJsonIniciales));
  let modeloActual = "";
  let ultimasFilas: Array<Record<string, unknown>> = [];

  function obtenerFilasModelo(modelo: string): Array<Record<string, unknown>> {
    const filas = filasPorModelo.get(modelo);
    if (filas) return filas;
    const nuevas: Array<Record<string, unknown>> = [];
    filasPorModelo.set(modelo, nuevas);
    return nuevas;
  }

  function perteneceAlTenant(modelo: string, fila: Record<string, unknown>, tenantId: string): boolean {
    if (modelo === "Tenant") return fila.id === tenantId;
    if (modelo !== "GarmentVariantOptionValue") return fila.tenantId === tenantId;

    const variantes = obtenerFilasModelo("GarmentVariant");
    const valores = obtenerFilasModelo("GarmentOptionValue");
    const variante = variantes.find((registro) => registro.id === fila.variantId);
    const valor = valores.find((registro) => registro.id === fila.optionValueId);
    return variante?.tenantId === tenantId && valor?.tenantId === tenantId;
  }

  function filasDeConsulta(
    modelo: string,
    where: Record<string, unknown>,
  ): Array<Record<string, unknown>> {
    if (modelo === "Tenant") {
      return tenant.id === where.id ? [{ ...tenant }] : [];
    }
    const tenantId = modelo === "GarmentVariantOptionValue"
      ? (where.variant as { is: { tenantId: string } }).is.tenantId
      : String(where.tenantId);
    return obtenerFilasModelo(modelo).filter((fila) => perteneceAlTenant(modelo, fila, tenantId));
  }

  function crearDelegado(modelo: string): DelegadoTransferencia {
    return {
      async findMany({ where, orderBy, take, skip }) {
        consultas.push({ modelo, where, orderBy, take, skip });
        modeloActual = modelo;
        const claves = Object.keys(orderBy);
        const ordenadas = filasDeConsulta(modelo, where).sort((a, b) => {
          for (const clave of claves) {
            const izquierda = String(a[clave] ?? "");
            const derecha = String(b[clave] ?? "");
            if (izquierda !== derecha) return izquierda < derecha ? -1 : 1;
          }
          return 0;
        });
        ultimasFilas = clonarFilas(ordenadas.slice(skip, skip + take));
        return clonarFilas(ultimasFilas);
      },
      async count({ where }) {
        return filasDeConsulta(modelo, where).length;
      },
      async createMany({ data }) {
        const lote = clonarFilas(data);
        const lotes = lotesPorModelo.get(modelo) ?? [];
        lotes.push(lote);
        lotesPorModelo.set(modelo, lotes);
        obtenerFilasModelo(modelo).push(...lote);
        return { count: data.length };
      },
      async update({ where, data }) {
        if (modelo !== "Tenant" || where.id !== tenant.id) {
          throw new Error(`No se esperaba actualizar ${modelo}`);
        }
        tenant = { ...tenant, ...data };
        return { ...tenant };
      },
    };
  }

  const delegados = new Map(
    MANIFIESTO_TABLAS_TENANT.map((entrada) => {
      const propiedad = `${entrada.modelo[0]?.toLowerCase() ?? ""}${entrada.modelo.slice(1)}`;
      return [propiedad, crearDelegado(entrada.modelo)] as const;
    }),
  );

  const clienteFalso = new Proxy({}, {
    get(_objetivo, propiedad) {
      if (propiedad === "$queryRaw") {
        return async () => {
          const camposJson = CAMPOS_JSON[modeloActual];
          if (!camposJson) {
            throw new Error(`No se esperaba una consulta SQL auxiliar para ${modeloActual}`);
          }
          return ultimasFilas.map((fila) => Object.fromEntries([
            ["__clave_0", fila.id],
            ...camposJson.map((campo) => {
              const valor = fila[campo];
              const tipo = valor === Prisma.DbNull
                ? null
                : valor === Prisma.JsonNull
                  ? "NULL"
                  : tiposJson.get(String(fila.id)) ?? (valor === null || valor === undefined ? null : "OBJECT");
              return [`__json_${campo}`, tipo];
            }),
          ]));
        };
      }
      if (typeof propiedad === "string") return delegados.get(propiedad);
      return undefined;
    },
  }) as ClienteTransferencia;

  return {
    cliente: clienteFalso,
    obtenerTenant: () => ({ ...tenant }),
    obtenerFilas: (modelo) => clonarFilas(obtenerFilasModelo(modelo)),
    obtenerConsultas: () => [...consultas],
    obtenerLotes: (modelo) => (lotesPorModelo.get(modelo) ?? []).map(clonarFilas),
  };
}

function crearFilasComerciales(): FilasPorModelo {
  const categoriasA = Array.from({ length: 251 }, (_valor, indice) => ({
    id: `categoria-a-${String(indice).padStart(3, "0")}`,
    tenantId: TENANT_A,
    name: `Categoría A ${indice}`,
  }));
  const categoriasB = [
    { id: "categoria-b-001", tenantId: TENANT_B, name: "Categoría B" },
  ];
  const prendas = [
    {
      id: "prenda-a-sql-null",
      tenantId: TENANT_A,
      name: "Prenda SQL NULL",
      price: new Prisma.Decimal("120.35"),
      etiquetas: null,
    },
    {
      id: "prenda-a-json-null",
      tenantId: TENANT_A,
      name: "Prenda JSON NULL",
      price: new Prisma.Decimal("7.10"),
      etiquetas: null,
    },
    {
      id: "prenda-b",
      tenantId: TENANT_B,
      name: "Prenda de otro tenant",
      price: new Prisma.Decimal("999.99"),
      etiquetas: null,
    },
  ];
  const variantes = [
    { id: "variante-a", tenantId: TENANT_A, garmentId: "prenda-a-sql-null" },
    { id: "variante-b", tenantId: TENANT_B, garmentId: "prenda-b" },
  ];
  const valores = [
    { id: "opcion-a", tenantId: TENANT_A, optionId: "opcion-padre-a", value: "A" },
    { id: "opcion-b", tenantId: TENANT_B, optionId: "opcion-padre-b", value: "B" },
  ];

  return {
    Category: [...categoriasA, ...categoriasB],
    Garment: prendas,
    GarmentVariant: variantes,
    GarmentOptionValue: valores,
    GarmentVariantOptionValue: [
      { variantId: "variante-a", optionValueId: "opcion-a" },
      { variantId: "variante-a", optionValueId: "opcion-b" },
      { variantId: "variante-b", optionValueId: "opcion-b" },
    ],
  };
}

async function main(): Promise<void> {
  const filasOrigen = crearFilasComerciales();
  const origen = crearClienteFalso(
    TENANT_ORIGEN,
    filasOrigen,
    {
      "prenda-a-sql-null": null,
      "prenda-a-json-null": "NULL",
      "prenda-b": "OBJECT",
    },
  );
  const destino = crearClienteFalso(TENANT_DESTINO_INICIAL);
  const resultados = await copiarDatos(
    origen.cliente,
    destino.cliente,
    TENANT_A,
    async () => undefined,
  );

  assert.deepEqual(destino.obtenerTenant(), TENANT_ORIGEN);
  assert.equal(resultados[0]?.modelo, "Tenant");
  assert.equal(resultados[0]?.filas, 1);

  const resultadoCategorias = resultados.find((resultado) => resultado.modelo === "Category");
  assert.equal(resultadoCategorias?.filas, 251);
  assert.equal(destino.obtenerFilas("Category").length, 251);
  assert.deepEqual(
    destino.obtenerLotes("Category").map((lote) => lote.length),
    [250, 1],
  );
  const consultasCategorias = origen.obtenerConsultas().filter((consulta) => consulta.modelo === "Category");
  assert.deepEqual(consultasCategorias.slice(0, 2).map(({ skip, take }) => ({ skip, take })), [
    { skip: 0, take: 250 },
    { skip: 250, take: 250 },
  ]);
  assert.deepEqual(consultasCategorias[0]?.where, construirWhere("Category", TENANT_A));
  assert.deepEqual(consultasCategorias[0]?.orderBy, ordenPrimario("Category"));

  const prendasDestino = destino.obtenerFilas("Garment");
  assert.deepEqual(prendasDestino.map((prenda) => prenda.id).sort(), [
    "prenda-a-json-null",
    "prenda-a-sql-null",
  ]);
  assert.equal(prendasDestino.find((prenda) => prenda.id === "prenda-a-sql-null")?.etiquetas, Prisma.DbNull);
  assert.equal(prendasDestino.find((prenda) => prenda.id === "prenda-a-json-null")?.etiquetas, Prisma.JsonNull);
  assert.equal(
    (prendasDestino.find((prenda) => prenda.id === "prenda-a-sql-null")?.price as Prisma.Decimal).toString(),
    "120.35",
  );

  assert.deepEqual(destino.obtenerFilas("GarmentVariantOptionValue"), [
    { variantId: "variante-a", optionValueId: "opcion-a" },
  ]);
  const consultaPuente = origen.obtenerConsultas().find(
    (consulta) => consulta.modelo === "GarmentVariantOptionValue",
  );
  assert.deepEqual(consultaPuente?.where, construirWhere("GarmentVariantOptionValue", TENANT_A));
  assert.deepEqual(consultaPuente?.orderBy, ordenPrimario("GarmentVariantOptionValue"));

  await verificarCopia(origen.cliente, destino.cliente, TENANT_A, resultados);

  const categoriasCorruptas = destino.obtenerFilas("Category");
  assert.ok(categoriasCorruptas[0]);
  categoriasCorruptas[0].name = "Dato alterado";
  const destinoCorrupto = crearClienteFalso(TENANT_ORIGEN, {
    ...filasOrigen,
    Category: categoriasCorruptas,
    Garment: prendasDestino,
    GarmentVariant: destino.obtenerFilas("GarmentVariant"),
    GarmentOptionValue: destino.obtenerFilas("GarmentOptionValue"),
    GarmentVariantOptionValue: destino.obtenerFilas("GarmentVariantOptionValue"),
  }, {
    "prenda-a-sql-null": null,
    "prenda-a-json-null": "NULL",
  });
  await assert.rejects(
    verificarCopia(origen.cliente, destinoCorrupto.cliente, TENANT_A, resultados),
    /La verificación de contenido no coincide para Category/,
  );

  console.log("Transferencia tenant: filtros, orden de padres/puente, paginación de lotes, Decimal, SQL NULL/JSON NULL y hashes verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
