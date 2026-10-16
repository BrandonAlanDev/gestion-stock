import "dotenv/config";

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { ClienteLogabyteCore, ErrorLogabyteCore } from "../src/lib/tenants/registry/cliente-logabyte-core";
import { ProveedorLogabyteCore } from "../src/lib/tenants/registry/proveedor-logabyte-core";
import { configurarProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import { conPrismaTenant, invalidarClientesPrismaTenant } from "../src/lib/tenants/prisma-factory";

interface DestinosPrueba { destinos: [string, string]; ids: [string, string] }
const token = "lbcore_abcdef123456.abcdefghijklmnopqrstuvwxyz0123456789ABCDE";
const hostnames = ["silo-a.example.test", "silo-b.example.test"];
const referencias = ["ref_silo_a", "ref_silo_b"];

function responder(respuesta: import("node:http").ServerResponse, estadoHttp: number, datos: unknown, error: string | null = null, metadatos: Record<string, unknown> = {}): void {
  respuesta.writeHead(estadoHttp, { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" });
  respuesta.end(JSON.stringify({
    datos,
    error: error ? { codigo: error, mensaje: "Error seguro" } : null,
    metadatos: { versionApi: "v1", solicitudId: "prueba-real", ...metadatos },
  }));
}

async function ejecutar(): Promise<void> {
  if (process.env.NODE_ENV === "production" || process.env.CORE_TEST_SILOS_MODE !== "1") {
    throw new Error("Esta prueba requiere CORE_TEST_SILOS_MODE=1 fuera de producción");
  }
  const destinos = JSON.parse(await readFile(path.join(process.cwd(), ".local", "core-test-targets.json"), "utf8")) as DestinosPrueba;
  assert.equal(destinos.destinos.length, 2);
  assert.equal(destinos.ids.length, 2);
  assert.notEqual(destinos.destinos[0], destinos.destinos[1]);
  for (const base of destinos.destinos) assert.match(base, /^lbcore_[a-f0-9]{8}_[ab]_test$/);

  const origen = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(origen.protocol, "mysql:");
  assert.equal(decodeURIComponent(origen.pathname.slice(1)), "pruebas_carrusel");
  let estadoA = "ACTIVO";
  let fallaCore = false;
  let consultasBase = 0;

  const servidor = createServer((solicitud, respuesta) => {
    if (solicitud.headers.authorization !== `Bearer ${token}`) {
      responder(respuesta, 401, null, "CREDENCIAL_INVALIDA");
      return;
    }
    const url = new URL(solicitud.url ?? "/", "http://127.0.0.1");
    if (fallaCore) {
      responder(respuesta, 503, null, "CORE_NO_DISPONIBLE");
      return;
    }
    let indice = -1;
    if (url.pathname === "/api/internal/v1/tenants/hostname") {
      indice = hostnames.indexOf(url.searchParams.get("hostname") ?? "");
      if (indice < 0) return responder(respuesta, 404, null, "NO_ENCONTRADO");
      responder(respuesta, 200, {
        ...metadata(indice), producto: "gestion-stock", hostname: hostnames[indice],
      });
      return;
    }
    if (url.pathname === "/api/internal/v1/tenants") {
      const cursor = url.searchParams.get("cursor");
      indice = cursor === destinos.ids[0] ? 1 : 0;
      responder(respuesta, 200, [{ ...metadata(indice), dominios: [hostnames[indice]] }], null, {
        limite: 100, siguienteCursor: indice === 0 ? destinos.ids[0] : null, hayMas: indice === 0,
      });
      return;
    }
    const partes = url.pathname.split("/");
    indice = destinos.ids.indexOf(partes[5]);
    if (indice < 0) return responder(respuesta, 404, null, "NO_ENCONTRADO");
    if (partes[6] === "estado") {
      responder(respuesta, 200, { tenantId: destinos.ids[indice], estado: indice === 0 ? estadoA : "ACTIVO", versionCache: indice === 0 && estadoA !== "ACTIVO" ? 2 : 1 });
      return;
    }
    if (partes[6] === "credenciales") {
      if (indice === 0 && estadoA !== "ACTIVO") return responder(respuesta, 409, null, "CONFLICTO");
      if (url.searchParams.get("referencia") !== referencias[indice] || url.searchParams.get("version") !== "1") {
        return responder(respuesta, 409, null, "CONFLICTO");
      }
      const uri = new URL(origen);
      uri.pathname = `/${destinos.destinos[indice]}`;
      responder(respuesta, 200, { tenantId: destinos.ids[indice], referencia: referencias[indice], version: 1, uri: uri.toString() });
      return;
    }
    responder(respuesta, 200, { ...metadata(indice), producto: "gestion-stock", dominios: [hostnames[indice]] });
  });

  function metadata(indice: number) {
    const estado = indice === 0 ? estadoA : "ACTIVO";
    return {
      id: destinos.ids[indice], nombre: `Silo de prueba ${indice + 1}`, slug: `silo-${indice + 1}`,
      estado, versionCache: indice === 0 && estado !== "ACTIVO" ? 2 : 1,
      versionCredenciales: 1, referenciaCredencial: estado === "ACTIVO" ? referencias[indice] : null,
    };
  }

  await new Promise<void>((resolver) => servidor.listen(0, "127.0.0.1", resolver));
  try {
    const direccion = servidor.address();
    if (!direccion || typeof direccion === "string") throw new Error("No se abrió el servidor de prueba");
    const cliente = new ClienteLogabyteCore({ urlBase: `http://127.0.0.1:${direccion.port}`, token, producto: "gestion-stock" });
    const registro = configurarProveedorRegistroTenant(new ProveedorLogabyteCore(cliente, cliente));
    const listado = await registro.listarTenants();
    assert.deepEqual(listado.map((fila) => fila.tenant.id), destinos.ids);
    for (const [indice, tenantId] of destinos.ids.entries()) {
      assert.equal((await registro.resolverPorHostname(hostnames[indice]))?.tenant.id, tenantId);
      const datos = await conPrismaTenant(tenantId, async (prisma) => {
        consultasBase += 1;
        const filas = await prisma.$queryRaw<Array<{ base: string }>>`SELECT DATABASE() AS base`;
        const tenants = await prisma.tenant.findMany({ select: { id: true } });
        return { base: filas[0]?.base, ids: tenants.map((fila) => fila.id) };
      });
      assert.equal(datos.base, destinos.destinos[indice]);
      assert.deepEqual(datos.ids, [tenantId]);
    }
    assert.equal(consultasBase, 2);
    estadoA = "SUSPENDIDO";
    await assert.rejects(conPrismaTenant(destinos.ids[0], async () => { consultasBase += 1; }), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "CONFLICTO");
    await assert.rejects(conPrismaTenant("tenant-inexistente", async () => { consultasBase += 1; }), /no está disponible/);
    fallaCore = true;
    await assert.rejects(conPrismaTenant(destinos.ids[1], async () => { consultasBase += 1; }), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "CORE_NO_DISPONIBLE");
    assert.equal(consultasBase, 2);
    console.log("Core HTTP simulado + dos bases MySQL reales: enrutamiento y fallos cerrados verificados");
  } finally {
    await Promise.all(destinos.ids.map((id) => invalidarClientesPrismaTenant(id)));
    await new Promise<void>((resolver) => servidor.close(() => resolver()));
  }
}

ejecutar().catch((error: unknown) => {
  console.error(error instanceof ErrorLogabyteCore ? error.codigo : error instanceof Error ? error.name : "ERROR");
  process.exitCode = 1;
});
