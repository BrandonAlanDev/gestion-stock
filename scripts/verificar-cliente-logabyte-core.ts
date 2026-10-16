import assert from "node:assert/strict";
import { ClienteLogabyteCore, ErrorLogabyteCore } from "../src/lib/tenants/registry/cliente-logabyte-core";
import { ProveedorLogabyteCore } from "../src/lib/tenants/registry/proveedor-logabyte-core";
import { ProveedorRegistroCacheado } from "../src/lib/tenants/registry/proveedor-cacheado";
import { configurarProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import { conPrismaTenant } from "../src/lib/tenants/prisma-factory";

const token = "lbcore_abcdef123456.abcdefghijklmnopqrstuvwxyz0123456789ABCDE";
const solicitudes: string[] = [];
let estadoSegundo = "ACTIVO";
let fallar = false;
let errorHttp: { estado: number; codigo: string } | null = null;
let timeout = false;

function sobre(datos: unknown, metadatos: Record<string, unknown> = {}): Response {
  return Response.json({ datos, error: null, metadatos: { versionApi: "v1", solicitudId: "prueba", ...metadatos } });
}

function errorCore(estado: number, codigo: string): Response {
  return Response.json({ datos: null, error: { codigo, mensaje: "Error seguro" }, metadatos: { versionApi: "v1", solicitudId: "prueba" } }, { status: estado });
}

function tenant(id: string, referencia: string) {
  return {
    id, nombre: id, slug: id, estado: id === "segundo" ? estadoSegundo : "ACTIVO",
    versionCache: id === "segundo" && estadoSegundo !== "ACTIVO" ? 2 : 1,
    versionCredenciales: 3,
    referenciaCredencial: id === "segundo" && estadoSegundo !== "ACTIVO" ? null : referencia,
  };
}

const fetchPrueba: typeof fetch = async (input, opciones) => {
  assert.equal(new Headers(opciones?.headers).get("authorization"), `Bearer ${token}`);
  assert.equal(opciones?.cache, "no-store");
  assert.equal(opciones?.redirect, "error");
  const url = new URL(String(input));
  solicitudes.push(url.pathname + url.search);
  if (timeout) throw new DOMException("Tiempo agotado", "TimeoutError");
  if (fallar) throw new Error("red no disponible: detalle privado");
  if (errorHttp) return errorCore(errorHttp.estado, errorHttp.codigo);
  if (url.pathname.endsWith("/hostname")) {
    const host = url.searchParams.get("hostname");
    if (host === "desconocido.ejemplo.com") return errorCore(404, "NO_ENCONTRADO");
    const id = host?.startsWith("primero") ? "primero" : "segundo";
    return sobre({ ...tenant(id, `ref_${id}`), producto: "gestion-stock", hostname: host });
  }
  if (url.pathname.endsWith("/estado")) {
    const id = url.pathname.split("/").at(-2);
    return sobre({ tenantId: id, estado: id === "segundo" ? estadoSegundo : "ACTIVO", versionCache: id === "segundo" && estadoSegundo !== "ACTIVO" ? 2 : 1 });
  }
  if (url.pathname.endsWith("/credenciales")) {
    const id = url.pathname.split("/").at(-2);
    if (id === "segundo" && estadoSegundo !== "ACTIVO") return errorCore(409, "CONFLICTO");
    const base = id === "primero" ? "base_primera" : "base_segunda";
    return sobre({ tenantId: id, referencia: url.searchParams.get("referencia"), version: 3, uri: `mysql://usuario:clave_${id}@db.ejemplo.com:3306/${base}` });
  }
  if (url.pathname.endsWith("/tenants")) {
    const cursor = url.searchParams.get("cursor");
    const filas = cursor ? [{ ...tenant("segundo", "ref_segundo"), dominios: ["segundo.ejemplo.com"] }]
      : [{ ...tenant("primero", "ref_primero"), dominios: ["primero.ejemplo.com"] }];
    return sobre(filas, { limite: 100, siguienteCursor: cursor ? null : "primero", hayMas: !cursor });
  }
  if (url.pathname.endsWith("/primero") || url.pathname.endsWith("/segundo")) {
    const id = url.pathname.split("/").at(-1) ?? "";
    return sobre({ ...tenant(id, `ref_${id}`), producto: "gestion-stock", dominios: [`${id}.ejemplo.com`] });
  }
  return errorCore(404, "NO_ENCONTRADO");
};

async function ejecutar(): Promise<void> {
  const cliente = new ClienteLogabyteCore({
    urlBase: "https://core.ejemplo.com",
    token,
    producto: "gestion-stock",
    fetchImpl: fetchPrueba,
  });
  const registro = new ProveedorRegistroCacheado(new ProveedorLogabyteCore(cliente, cliente));
  const primero = await registro.resolverPorHostname("primero.ejemplo.com");
  const segundo = await registro.resolverPorId("segundo");
  assert.equal(primero?.tenant.id, "primero");
  assert.equal(segundo?.tenant.id, "segundo");
  assert.equal((await registro.listarTenants()).length, 2);
  const credencialPrimera = await registro.resolverCredenciales("ref_primero", "3", "primero");
  const credencialSegunda = await registro.resolverCredenciales("ref_segundo", "3", "segundo");
  assert.equal(credencialPrimera.base, "base_primera");
  assert.equal(credencialSegunda.base, "base_segunda");
  assert.notEqual(credencialPrimera.contrasena, credencialSegunda.contrasena);
  assert.equal(credencialPrimera.ssl, true);
  assert.equal(await registro.verificarAcceso("primero"), 1);
  assert.equal(await registro.resolverPorHostname("desconocido.ejemplo.com"), null);

  const cacheRuntime = configurarProveedorRegistroTenant(new ProveedorLogabyteCore(cliente, cliente));
  await cacheRuntime.resolverPorId("segundo");
  estadoSegundo = "SUSPENDIDO";
  await assert.rejects(registro.verificarAcceso("segundo"), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "CONFLICTO");
  await assert.rejects(registro.resolverCredenciales("ref_segundo", "3", "segundo"), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "CONFLICTO");
  let entroEnBase = false;
  await assert.rejects(conPrismaTenant("segundo", async () => { entroEnBase = true; }), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "CONFLICTO");
  await assert.rejects(conPrismaTenant("inexistente", async () => { entroEnBase = true; }), /no está disponible/);
  assert.equal(entroEnBase, false);
  fallar = true;
  await assert.rejects(registro.verificarAcceso("primero"), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "RED" && !error.message.includes("detalle privado"));
  fallar = false;
  timeout = true;
  await assert.rejects(registro.verificarAcceso("primero"), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === "TIMEOUT");
  timeout = false;
  for (const fallo of [
    { estado: 401, codigo: "CREDENCIAL_INVALIDA" },
    { estado: 403, codigo: "PERMISO_INSUFICIENTE" },
    { estado: 429, codigo: "LIMITE_EXCEDIDO" },
    { estado: 503, codigo: "CORE_NO_DISPONIBLE" },
  ]) {
    errorHttp = fallo;
    await assert.rejects(registro.verificarAcceso("primero"), (error: unknown) => error instanceof ErrorLogabyteCore && error.codigo === fallo.codigo);
  }
  errorHttp = null;
  assert.ok(solicitudes.some((ruta) => ruta.includes("cursor=primero")));
  console.log("Contrato Core: paginación, dos silos, suspensión y caída verificados con transporte simulado");
}

ejecutar().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
