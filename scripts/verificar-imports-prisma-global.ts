import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const raizRepositorio = path.resolve(__dirname, "..");
const rutaAllowlist = path.join(__dirname, "allowlist-prisma-compat.json");
const segmentosIgnorados = new Set([
  ".next",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "generated",
  ".git",
  ".agents",
  ".codex",
  "node_modules",
  "out",
]);

type Hallazgo = {
  archivo: string;
  linea: number;
  tipo: "compatibilidad" | "cliente-directo";
};

const ARCHIVO_FACTORY_PRISMA = "src/lib/prisma.ts";

function normalizarRuta(ruta: string): string {
  return ruta.replace(/\\/g, "/");
}

function esFuenteIncluida(ruta: string): boolean {
  const partes = ruta.split("/");
  return (
    /\.(?:ts|tsx)$/i.test(ruta) &&
    !partes.some((parte) => segmentosIgnorados.has(parte))
  );
}

function obtenerArchivosFuente(): string[] {
  const archivos: string[] = [];
  const pendientes = [raizRepositorio];

  while (pendientes.length > 0) {
    const directorio = pendientes.pop();
    if (!directorio) continue;

    for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
      const absoluta = path.join(directorio, entrada.name);
      const relativa = normalizarRuta(path.relative(raizRepositorio, absoluta));
      if (entrada.isDirectory()) {
        if (!segmentosIgnorados.has(entrada.name)) pendientes.push(absoluta);
        continue;
      }
      if (entrada.isFile() && esFuenteIncluida(relativa)) archivos.push(relativa);
    }
  }

  return archivos.sort();
}

function cargarAllowlist(): Set<string> {
  let contenido: unknown;
  try {
    contenido = JSON.parse(readFileSync(rutaAllowlist, "utf8")) as unknown;
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    throw new Error(`No se pudo leer ${normalizarRuta(path.relative(raizRepositorio, rutaAllowlist))}: ${detalle}`);
  }

  if (
    !Array.isArray(contenido) ||
    !contenido.every((ruta): ruta is string => typeof ruta === "string")
  ) {
    throw new Error("La allowlist debe ser un arreglo JSON de rutas de archivo.");
  }

  const rutasNormalizadas = contenido.map(normalizarRuta);
  if (new Set(rutasNormalizadas).size !== rutasNormalizadas.length) {
    throw new Error("La allowlist contiene rutas repetidas.");
  }

  return new Set(rutasNormalizadas);
}

function esModuloPrismaCompat(ruta: ts.Expression): boolean {
  return ts.isStringLiteralLike(ruta) && ruta.text === "@/lib/tenants/prisma-factory";
}

function buscarImportsPrisma(archivo: string, contenido: string): Hallazgo[] {
  const tipoArchivo = archivo.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
  const fuente = ts.createSourceFile(
    archivo,
    contenido,
    ts.ScriptTarget.Latest,
    true,
    tipoArchivo,
  );
  const hallazgos: Hallazgo[] = [];
  const nombresClienteDirecto = new Set<string>();

  function registrar(nodo: ts.Node): void {
    const posicion = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente));
    hallazgos.push({ archivo, linea: posicion.line + 1, tipo: "compatibilidad" });
  }

  function recolectarClientesImportados(nodo: ts.Node): void {
    if (ts.isImportDeclaration(nodo) && ts.isStringLiteralLike(nodo.moduleSpecifier)) {
      const modulo = nodo.moduleSpecifier.text.replace(/\\/g, "/");
      const importaClienteGenerado = /(?:^|\/)generated\/prisma\/client$/.test(modulo);
      const clausula = nodo.importClause;
      const enlace = clausula?.namedBindings;
      if (
        importaClienteGenerado &&
        clausula &&
        !clausula.isTypeOnly &&
        enlace &&
        ts.isNamedImports(enlace)
      ) {
        for (const especificador of enlace.elements) {
          const nombreImportado = especificador.propertyName?.text ?? especificador.name.text;
          if (nombreImportado === "PrismaClient" && !especificador.isTypeOnly) {
            nombresClienteDirecto.add(especificador.name.text);
          }
        }
      }
    }

    ts.forEachChild(nodo, recolectarClientesImportados);
  }

  recolectarClientesImportados(fuente);

  function visitar(nodo: ts.Node): void {

    if (
      ts.isImportDeclaration(nodo) &&
      esModuloPrismaCompat(nodo.moduleSpecifier)
    ) {
      registrar(nodo);
    } else if (
      ts.isExportDeclaration(nodo) &&
      nodo.moduleSpecifier !== undefined &&
      esModuloPrismaCompat(nodo.moduleSpecifier)
    ) {
      registrar(nodo);
    } else if (
      ts.isImportEqualsDeclaration(nodo) &&
      ts.isExternalModuleReference(nodo.moduleReference) &&
      nodo.moduleReference.expression !== undefined &&
      esModuloPrismaCompat(nodo.moduleReference.expression)
    ) {
      registrar(nodo);
    } else if (
      ts.isCallExpression(nodo) &&
      nodo.arguments.length === 1 &&
      esModuloPrismaCompat(nodo.arguments[0]) &&
      (nodo.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(nodo.expression) && nodo.expression.text === "require"))
    ) {
      registrar(nodo);
    } else if (
      ts.isImportTypeNode(nodo) &&
      ts.isLiteralTypeNode(nodo.argument) &&
      esModuloPrismaCompat(nodo.argument.literal)
    ) {
      registrar(nodo);
    }

    if (
      archivo.startsWith("src/") &&
      archivo !== ARCHIVO_FACTORY_PRISMA &&
      ts.isNewExpression(nodo) &&
      ts.isIdentifier(nodo.expression) &&
      nombresClienteDirecto.has(nodo.expression.text)
    ) {
      const posicion = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente));
      hallazgos.push({ archivo, linea: posicion.line + 1, tipo: "cliente-directo" });
    }

    ts.forEachChild(nodo, visitar);
  }

  visitar(fuente);
  return hallazgos;
}

function main(): number {
  let allowlist: Set<string>;
  let archivos: string[];

  try {
    allowlist = cargarAllowlist();
    archivos = obtenerArchivosFuente();
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    console.error(`No se pudo verificar la compatibilidad Prisma: ${detalle}`);
    return 2;
  }

  const importsPorArchivo = new Map<string, Hallazgo[]>();
  for (const archivo of archivos) {
    const rutaAbsoluta = path.resolve(raizRepositorio, archivo);
    if (!existsSync(rutaAbsoluta)) continue;

    const contenido = readFileSync(rutaAbsoluta, "utf8");
    const hallazgos = buscarImportsPrisma(archivo, contenido);
    if (hallazgos.length > 0) importsPorArchivo.set(archivo, hallazgos);
  }

  const importsNuevos = [...importsPorArchivo.entries()]
    .filter(([archivo]) => !allowlist.has(archivo))
    .flatMap(([, hallazgos]) => hallazgos.filter((hallazgo) => hallazgo.tipo === "compatibilidad"));
  const clientesDirectos = [...importsPorArchivo.values()]
    .flat()
    .filter((hallazgo) => hallazgo.tipo === "cliente-directo");
  const allowlistObsoleta = [...allowlist].filter(
    (archivo) => !importsPorArchivo.has(archivo),
  );

  if (importsNuevos.length > 0 || clientesDirectos.length > 0 || allowlistObsoleta.length > 0) {
    if (importsNuevos.length > 0) {
      console.error(
        "Se detectaron imports del factory de silos anterior:",
      );
      for (const hallazgo of importsNuevos) {
        console.error(`  ${hallazgo.archivo}:${hallazgo.linea}`);
      }
      console.error(
        "Usá src/lib/prisma.ts para acceder a la base única.",
      );
    }

    if (clientesDirectos.length > 0) {
      console.error("La aplicación debe crear PrismaClient únicamente desde src/lib/prisma.ts:");
      for (const hallazgo of clientesDirectos) {
        console.error(`  ${hallazgo.archivo}:${hallazgo.linea}`);
      }
    }

    if (allowlistObsoleta.length > 0) {
      console.error("La allowlist contiene rutas que ya no importan el factory anterior:");
      for (const archivo of allowlistObsoleta.sort()) {
        console.error(`  ${archivo}`);
      }
      console.error("Retirá esas rutas de scripts/allowlist-prisma-compat.json.");
    }

    return 1;
  }

  console.log(
    `Verificación correcta: ${importsPorArchivo.size} imports heredados permitidos; PrismaClient solo se instancia desde ${ARCHIVO_FACTORY_PRISMA}.`,
  );
  return 0;
}

process.exitCode = main();
