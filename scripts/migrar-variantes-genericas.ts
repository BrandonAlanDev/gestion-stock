import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const esLocal =
  process.env.DATABASE_HOST === "localhost" ||
  process.env.DATABASE_HOST === "127.0.0.1";

const adaptador = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: esLocal ? false : { rejectUnauthorized: true },
  connectionLimit: 10,
  connectTimeout: 10000,
});

const prisma = new PrismaClient({ adapter: adaptador });

type Variante = {
  id: string;
  tenantId: string;
  size?: { value: string; order: number } | null;
  color?: { name: string } | null;
  attributes?: unknown;
};

type ProductoConVariantes = { id: string; tenantId: string; variants: Variante[] };

type Grupo = { nombre: string; valores: string[] };

function construirGrupos(variantes: Variante[]): Grupo[] {
  const grupos: Grupo[] = [];
  const talles = Array.from(new Map(variantes.filter((v) => v.size).map((v) => [v.size!.value, v.size!])).values())
    .sort((a, b) => a.order - b.order);
  if (talles.length) grupos.push({ nombre: "Talle", valores: talles.map((t) => t.value) });
  const colores = Array.from(new Map(variantes.filter((v) => v.color).map((v) => [v.color!.name, v.color!])).values())
    .sort((a, b) => a.name.localeCompare(b.name));
  if (colores.length) grupos.push({ nombre: "Color", valores: colores.map((c) => c.name) });
  const medidas = Array.from(
    new Set(
      variantes
        .map((v) => (v.attributes as { customSize?: string } | null)?.customSize ?? "")
        .filter((f) => typeof f === "string" && f.trim() !== "")
    )
  );
  if (medidas.length) grupos.push({ nombre: "Medida", valores: medidas });
  return grupos;
}

async function ejecutar(): Promise<void> {
  console.log("➡️ Migrando variantes legadas a opciones genéricas...");
  const productos = (await prisma.garment.findMany({
    where: { variants: { some: {} } },
    include: { variants: { include: { size: true, color: true } } },
  })) as unknown as ProductoConVariantes[];

  console.log(`   Productos con variantes: ${productos.length}`);

  const idsProductos = productos.map((p) => p.id);

  const opcionesExistentes = await prisma.garmentOption.findMany({
    where: { garmentId: { in: idsProductos } },
    include: { values: true },
  });
  // Preservar duplicados de nombre por producto (pueden existir varios "Talle" etc.) -> usar mapa por clave
  const opcionesPorClave = new Map<string, { id: string; name: string; values: Map<string, string> }>();
  for (const opcion of opcionesExistentes) {
    const clave = `${opcion.garmentId}::${opcion.name}`;
    const valores = new Map(opcion.values.map((v) => [v.value, v.id]));
    opcionesPorClave.set(clave, { id: opcion.id, name: opcion.name, values: valores });
  }

  const nuevasOpciones: Array<{ id: string; tenantId: string; garmentId: string; name: string; position: number }> = [];
  const nuevosValores: Array<{ id: string; tenantId: string; optionId: string; value: string; position: number }> = [];
  const vinculos: Array<{ variantId: string; optionValueId: string }> = [];

  for (const producto of productos) {
    const grupos = construirGrupos(producto.variants);
    let posicionOpcion = 0;
    for (const grupo of grupos) {
      const clave = `${producto.id}::${grupo.nombre}`;
      let registro = opcionesPorClave.get(clave);
      if (!registro) {
        const idNueva = randomUUID();
        nuevasOpciones.push({
          id: idNueva,
          tenantId: producto.tenantId,
          garmentId: producto.id,
          name: grupo.nombre,
          position: posicionOpcion,
        });
        registro = { id: idNueva, name: grupo.nombre, values: new Map() };
        opcionesPorClave.set(clave, registro);
      }
      let posicionValor = registro.values.size;
      for (const valor of grupo.valores) {
        if (!registro.values.has(valor)) {
          const idValor = randomUUID();
          nuevosValores.push({
            id: idValor,
            tenantId: producto.tenantId,
            optionId: registro.id,
            value: valor,
            position: posicionValor,
          });
          registro.values.set(valor, idValor);
          posicionValor += 1;
        }
      }
    }

    for (const variante of producto.variants) {
      const talle = opcionesPorClave.get(`${producto.id}::Talle`);
      if (variante.size && talle) {
        const idValor = talle.values.get(variante.size.value);
        if (idValor) vinculos.push({ variantId: variante.id, optionValueId: idValor });
      }
      const color = opcionesPorClave.get(`${producto.id}::Color`);
      if (variante.color && color) {
        const idValor = color.values.get(variante.color.name);
        if (idValor) vinculos.push({ variantId: variante.id, optionValueId: idValor });
      }
      const medida = opcionesPorClave.get(`${producto.id}::Medida`);
      const custom = (variante.attributes as { customSize?: string } | null)?.customSize;
      if (medida && typeof custom === "string" && custom.trim() !== "") {
        const idValor = medida.values.get(custom);
        if (idValor) vinculos.push({ variantId: variante.id, optionValueId: idValor });
      }
    }
  }

  if (nuevasOpciones.length) {
    await prisma.garmentOption.createMany({ data: nuevasOpciones, skipDuplicates: true });
    console.log(`   Opciones creadas: ${nuevasOpciones.length}`);
  }
  if (nuevosValores.length) {
    await prisma.garmentOptionValue.createMany({ data: nuevosValores, skipDuplicates: true });
    console.log(`   Valores creados: ${nuevosValores.length}`);
  }
  if (vinculos.length) {
    await prisma.garmentVariantOptionValue.createMany({ data: vinculos, skipDuplicates: true });
    console.log(`   Vínculos creados: ${vinculos.length}`);
  }

  console.log("✅ Migración completada.");
  await prisma.$disconnect();
}

ejecutar().catch((error) => {
  console.error("❌ Error en migración:", error);
  process.exitCode = 1;
});
