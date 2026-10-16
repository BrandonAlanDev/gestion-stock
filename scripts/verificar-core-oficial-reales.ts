import "dotenv/config";

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import mariadb from "mariadb";
import { parse } from "dotenv";
import { ClienteLogabyteCore, ErrorLogabyteCore } from "../src/lib/tenants/registry/cliente-logabyte-core";
import { ProveedorLogabyteCore } from "../src/lib/tenants/registry/proveedor-logabyte-core";
import { configurarProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import { conPrismaTenant, invalidarClientesPrismaTenant } from "../src/lib/tenants/prisma-factory";

interface Fixture {
  ids: [string, string];
  destinos: [string, string];
  dominios: [string, string];
  referencias: [string, string];
}

async function ejecutar(): Promise<void> {
  if (process.env.CORE_TEST_OFFICIAL_MODE !== "1" || process.env.NODE_ENV === "production") {
    throw new Error("Esta prueba requiere CORE_TEST_OFFICIAL_MODE=1 fuera de producción");
  }
  const raiz = process.cwd();
  const fixture = JSON.parse(await readFile(path.join(raiz, ".local/core-test-fixture.json"), "utf8")) as Fixture;
  const token = (await readFile(path.join(raiz, ".local/core-test-service-token"), "utf8")).trim();
  const coreEnv = parse(await readFile(path.resolve(raiz, "../logabyte/.env")));
  const urlCore = new URL(coreEnv.LOGABYTE_CORE_DATABASE_URL);
  const urlServicio = process.env.CORE_TEST_URL ?? "http://localhost:3100";
  assert.equal(urlCore.pathname, "/logabyte_core");
  assert.equal(fixture.ids.length, 2);
  assert.notEqual(fixture.destinos[0], fixture.destinos[1]);
  for (const base of fixture.destinos) assert.match(base, /^lbcore_[a-f0-9]{8}_[ab]_test$/u);
  const cliente = new ClienteLogabyteCore({ urlBase: urlServicio, token, producto: "gestion-stock" });
  const registro = configurarProveedorRegistroTenant(new ProveedorLogabyteCore(cliente, cliente));
  if (process.env.CORE_TEST_OFFICIAL_OUTAGE === "1") {
    let operaciones = 0;
    await assert.rejects(conPrismaTenant(fixture.ids[0], async () => { operaciones++; }),
      (error: unknown) => error instanceof ErrorLogabyteCore && ["RED", "TIMEOUT"].includes(error.codigo));
    assert.equal(operaciones, 0);
    console.log("Core real detenido: acceso a la base bloqueado antes de ejecutar la operación");
    return;
  }
  const conexion = await mariadb.createConnection({
    host: urlCore.hostname,
    port: Number(urlCore.port || 3306),
    user: decodeURIComponent(urlCore.username),
    password: decodeURIComponent(urlCore.password),
    database: "logabyte_core",
    ssl: { rejectUnauthorized: true },
    connectTimeout: 10_000,
  });
  let suspendido = false;
  let versionAnterior = 0;
  let consultasBase = 0;
  try {
    const primeraRespuesta = await fetch(`${urlServicio}/api/internal/v1/tenants?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    assert.equal(primeraRespuesta.status, 200);
    const primeraPagina = await primeraRespuesta.json() as {
      datos: Array<{ id: string }>;
      metadatos: { siguienteCursor: string | null; hayMas: boolean };
    };
    assert.equal(primeraPagina.datos.length, 1);
    assert.equal(primeraPagina.metadatos.hayMas, true);
    assert.equal(primeraPagina.metadatos.siguienteCursor, primeraPagina.datos[0].id);
    const segundaRespuesta = await fetch(`${urlServicio}/api/internal/v1/tenants?limit=1&cursor=${encodeURIComponent(primeraPagina.datos[0].id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    assert.equal(segundaRespuesta.status, 200);
    const segundaPagina = await segundaRespuesta.json() as {
      datos: Array<{ id: string }>;
      metadatos: { hayMas: boolean };
    };
    assert.equal(segundaPagina.datos.length, 1);
    assert.equal(segundaPagina.metadatos.hayMas, false);
    assert.notEqual(segundaPagina.datos[0].id, primeraPagina.datos[0].id);
    const lista = await registro.listarTenants();
    assert.deepEqual(new Set(lista.map((fila) => fila.tenant.id)), new Set(fixture.ids));
    for (let indice = 0; indice < 2; indice++) {
      const tenantId = fixture.ids[indice];
      assert.equal((await registro.resolverPorHostname(fixture.dominios[indice]))?.tenant.id, tenantId);
      assert.equal((await registro.resolverPorId(tenantId))?.referenciaBase, fixture.referencias[indice]);
      const datos = await conPrismaTenant(tenantId, async (prisma) => {
        consultasBase++;
        const base = await prisma.$queryRaw<Array<{ base: string }>>`SELECT DATABASE() AS base`;
        const tenants = await prisma.tenant.findMany({ select: { id: true } });
        return { base: base[0]?.base, ids: tenants.map((tenant) => tenant.id) };
      });
      assert.equal(datos.base, fixture.destinos[indice]);
      assert.deepEqual(datos.ids, [tenantId]);
    }
    assert.equal(await registro.resolverPorHostname("inexistente.example.test"), null);
    await assert.rejects(conPrismaTenant("tenant-inexistente", async () => { consultasBase++; }), /no está disponible/u);

    const tokenIncorrecto = new ClienteLogabyteCore({
      urlBase: urlServicio,
      token: "lbcore_abcdef123456.abcdefghijklmnopqrstuvwxyz0123456789ABCDE",
      producto: "gestion-stock",
    });
    await assert.rejects(tokenIncorrecto.resolverPorId(fixture.ids[0]),
      (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "CREDENCIAL_INVALIDA");
    await assert.rejects(cliente.resolver(fixture.referencias[0], "2", fixture.ids[0]),
      (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "CONFLICTO");

    const filas = await conexion.query("SELECT estado, version_cache FROM tenants WHERE id = ?", [fixture.ids[0]]);
    assert.equal(filas.length, 1);
    assert.equal(filas[0].estado, "ACTIVO");
    versionAnterior = Number(filas[0].version_cache);
    const cambio = await conexion.query("UPDATE tenants SET estado = 'SUSPENDIDO', version_cache = version_cache + 1, actualizado_en = NOW(3) WHERE id = ? AND estado = 'ACTIVO' AND version_cache = ?", [fixture.ids[0], versionAnterior]);
    assert.equal(Number(cambio.affectedRows), 1);
    suspendido = true;
    await assert.rejects(conPrismaTenant(fixture.ids[0], async () => { consultasBase++; }),
      (error: unknown) =>
        (error instanceof ErrorLogabyteCore && error.codigo === "CONFLICTO") ||
        (error instanceof Error && error.message === "La organización no está disponible"));
    assert.equal(consultasBase, 2);
    console.log("Core real + dos bases MySQL distintas: resolución, paginación, credenciales, aislamiento y fallos cerrados verificados");
  } finally {
    if (suspendido) {
      const restauracion = await conexion.query("UPDATE tenants SET estado = 'ACTIVO', version_cache = ?, actualizado_en = NOW(3) WHERE id = ? AND estado = 'SUSPENDIDO' AND version_cache = ?",
        [versionAnterior + 2, fixture.ids[0], versionAnterior + 1]);
      assert.equal(Number(restauracion.affectedRows), 1);
    }
    await Promise.all(fixture.ids.map((id) => invalidarClientesPrismaTenant(id)));
    await conexion.end();
  }
}

ejecutar().catch((error: unknown) => {
  const ubicacion = error instanceof Error ? error.stack?.split("\n").find((linea) => linea.includes("verificar-core-oficial-reales.ts:"))?.trim() : undefined;
  console.error(JSON.stringify({ fallo: error instanceof ErrorLogabyteCore ? error.codigo : error instanceof Error ? error.name : "ERROR", ubicacion }));
  process.exitCode = 1;
});
