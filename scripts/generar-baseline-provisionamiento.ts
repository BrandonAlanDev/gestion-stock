import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const nombreBaseline = "20261017000000_baseline_silos_nuevos";
const rutaMigraciones = path.resolve(process.cwd(), "prisma/migrations");
const rutaBaseline = path.join(rutaMigraciones, nombreBaseline, "migration.sql");
const rutaManifiesto = path.resolve(process.cwd(), "prisma/provisioning-baseline-history.json");
const actualizar = process.argv.includes("--actualizar");

function obtenerCliPrisma(): string {
  const requireProyecto = createRequire(path.resolve(process.cwd(), "package.json"));
  const rutaPaquete = requireProyecto.resolve("prisma/package.json");
  return path.join(path.dirname(rutaPaquete), "build", "index.js");
}

async function obtenerBaselineGenerada(): Promise<string> {
  const sql = execFileSync(process.execPath, [
    obtenerCliPrisma(),
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    windowsHide: true,
  });
  const baseline = sql.replace(/^CREATE TABLE `/gm, "CREATE TABLE IF NOT EXISTS `");
  const tablas = baseline.match(/^CREATE TABLE IF NOT EXISTS `/gm) ?? [];
  assert.equal(tablas.length, 31, "La baseline debe crear los 31 modelos actuales");
  assert.doesNotMatch(baseline, /^ALTER TABLE|^DROP\s/m, "La baseline solo debe crear tablas desde cero");
  return `${baseline.trimEnd()}\n`;
}

async function obtenerManifiesto(): Promise<{ version: string; migraciones: Array<{ nombre: string; checksum: string }> }> {
  const carpetas = (await readdir(rutaMigraciones, { withFileTypes: true }))
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => entrada.name)
    .filter((nombre) => nombre !== nombreBaseline)
    .sort();
  const nombres = [...carpetas, nombreBaseline].sort();
  const migraciones = await Promise.all(nombres.map(async (nombre) => {
    const sql = await readFile(path.join(rutaMigraciones, nombre, "migration.sql"));
    return { nombre, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
  return { version: "gestion-stock-2026.10", migraciones };
}

async function main(): Promise<void> {
  const baseline = await obtenerBaselineGenerada();
  if (actualizar) {
    await mkdir(path.dirname(rutaBaseline), { recursive: true });
    await writeFile(rutaBaseline, baseline, "utf8");
    await writeFile(rutaManifiesto, `${JSON.stringify(await obtenerManifiesto(), null, 2)}\n`, "utf8");
  } else {
    const [baselineExistente, manifiestoExistente] = await Promise.all([
      readFile(rutaBaseline, "utf8"),
      readFile(rutaManifiesto, "utf8"),
    ]);
    assert.equal(baselineExistente, baseline, "La baseline no coincide con prisma/schema.prisma; regenerala de forma explícita");
    assert.deepEqual(JSON.parse(manifiestoExistente), await obtenerManifiesto(), "El manifiesto de checksums no coincide con las migraciones versionadas");
  }
  console.log(`Baseline de gestion-stock verificada: 31 tablas, ${(await obtenerManifiesto()).migraciones.length} migraciones y sin ALTER/DROP.`);
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
