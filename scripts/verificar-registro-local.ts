import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cifrarRegistroLocal } from "../src/lib/tenants/registry/cifrado-registro-local";
import { ProveedorRegistroCacheado } from "../src/lib/tenants/registry/proveedor-cacheado";
import { ProveedorRegistroLocal } from "../src/lib/tenants/registry/proveedor-local";

interface TenantFixture {
  id: string;
  nombre: string;
  slug: string;
  dominio: string;
  dominios: string[];
  estado: "ACTIVO" | "SUSPENDIDO";
  referenciaBase: string;
  versionCredenciales: string;
}

interface ConexionFixture {
  host: string;
  puerto: number;
  usuario: string;
  contrasena: string;
  base: string;
  ssl: boolean;
}

interface RegistroFixture {
  version: 1;
  tenants: TenantFixture[];
  conexiones: Record<string, ConexionFixture>;
}

interface SobreCifrado {
  version: number;
  iv: string;
  etiqueta: string;
  contenido: string;
}

function crearRegistroFixture(): RegistroFixture {
  return {
    version: 1,
    tenants: [
      {
        id: "tenant-local-uno",
        nombre: "Tienda uno",
        slug: "tienda-uno",
        dominio: "tienda-uno.example.test",
        dominios: ["tienda-uno.example.test"],
        estado: "ACTIVO",
        referenciaBase: "mysql/tenant-local-uno",
        versionCredenciales: "v1",
      },
      {
        id: "tenant-local-dos",
        nombre: "Tienda dos",
        slug: "tienda-dos",
        dominio: "tienda-dos.example.test",
        dominios: ["tienda-dos.example.test"],
        estado: "ACTIVO",
        referenciaBase: "mysql/tenant-local-dos",
        versionCredenciales: "v4",
      },
    ],
    conexiones: {
      "mysql/tenant-local-uno": {
        host: "mysql-uno.example.test",
        puerto: 3306,
        usuario: "usuario-uno",
        contrasena: "clave-ficticia-uno",
        base: "tienda_uno",
        ssl: true,
      },
      "mysql/tenant-local-dos": {
        host: "mysql-dos.example.test",
        puerto: 3307,
        usuario: "usuario-dos",
        contrasena: "clave-ficticia-dos",
        base: "tienda_dos",
        ssl: true,
      },
    },
  };
}

function crearProveedor(rutaArchivo: string, claveHexadecimal: string): ProveedorRegistroLocal {
  return new ProveedorRegistroLocal({ rutaArchivo, claveHexadecimal, ttlMs: 0 });
}

async function guardarRegistro(
  rutaArchivo: string,
  registro: RegistroFixture,
  claveHexadecimal: string,
): Promise<void> {
  const contenido = cifrarRegistroLocal(JSON.stringify(registro), claveHexadecimal);
  await writeFile(rutaArchivo, `${contenido}\n`, { encoding: "utf8", flag: "wx" });
}

async function verificarDosTenantsYCredenciales(
  directorio: string,
  claveHexadecimal: string,
): Promise<void> {
  const rutaArchivo = path.join(directorio, "registro-valido.enc.json");
  await guardarRegistro(rutaArchivo, crearRegistroFixture(), claveHexadecimal);
  const proveedor = crearProveedor(rutaArchivo, claveHexadecimal);

  const tenantUno = await proveedor.resolverPorHostname("TIENDA-UNO.EXAMPLE.TEST:443");
  const tenantDos = await proveedor.resolverPorId("tenant-local-dos");
  assert.equal(tenantUno?.tenant.id, "tenant-local-uno");
  assert.equal(tenantDos?.tenant.id, "tenant-local-dos");
  assert.equal(
    await proveedor.resolverPorHostname("no-registrado.example.test"),
    null,
  );

  const tenants = await proveedor.listarTenants();
  assert.deepEqual(tenants.map(({ tenant }) => tenant.id).sort(), [
    "tenant-local-dos",
    "tenant-local-uno",
  ]);
  assert.equal("contrasena" in (tenants[0] ?? {}), false);

  assert.deepEqual(
    await proveedor.resolverCredenciales("mysql/tenant-local-uno", "v1"),
    crearRegistroFixture().conexiones["mysql/tenant-local-uno"],
  );
  assert.deepEqual(
    await proveedor.resolverCredenciales("mysql/tenant-local-dos", "v4"),
    crearRegistroFixture().conexiones["mysql/tenant-local-dos"],
  );
  await assert.rejects(
    proveedor.resolverCredenciales("mysql/tenant-local-uno", "v2"),
    /referencia o versión de conexión.*no está disponible/,
  );
  await assert.rejects(
    proveedor.resolverCredenciales("mysql/no-registrada", "v1"),
    /referencia o versión de conexión.*no está disponible/,
  );
}

async function verificarDominiosDuplicados(
  directorio: string,
  claveHexadecimal: string,
): Promise<void> {
  const registro = crearRegistroFixture();
  const segundo = registro.tenants[1];
  assert.ok(segundo);
  segundo.dominio = "tienda-uno.example.test";
  segundo.dominios = ["tienda-uno.example.test"];

  const rutaArchivo = path.join(directorio, "dominios-duplicados.enc.json");
  await guardarRegistro(rutaArchivo, registro, claveHexadecimal);
  await assert.rejects(
    crearProveedor(rutaArchivo, claveHexadecimal).listarTenants(),
    /asigna un dominio a más de un tenant/,
  );
}

async function verificarReferenciasDuplicadas(
  directorio: string,
  claveHexadecimal: string,
): Promise<void> {
  const registro = crearRegistroFixture();
  const segundo = registro.tenants[1];
  assert.ok(segundo);
  segundo.referenciaBase = "mysql/tenant-local-uno";

  const rutaArchivo = path.join(directorio, "referencias-duplicadas.enc.json");
  await guardarRegistro(rutaArchivo, registro, claveHexadecimal);
  await assert.rejects(
    crearProveedor(rutaArchivo, claveHexadecimal).listarTenants(),
    /referencia de base independiente/,
  );
}

async function verificarDestinosFisicosDuplicados(
  directorio: string,
  claveHexadecimal: string,
): Promise<void> {
  const registro = crearRegistroFixture();
  const conexionUno = registro.conexiones["mysql/tenant-local-uno"];
  const conexionDos = registro.conexiones["mysql/tenant-local-dos"];
  assert.ok(conexionUno);
  assert.ok(conexionDos);
  conexionDos.host = conexionUno.host.toUpperCase();
  conexionDos.puerto = conexionUno.puerto;
  conexionDos.base = conexionUno.base.toUpperCase();

  const rutaArchivo = path.join(directorio, "destinos-duplicados.enc.json");
  await guardarRegistro(rutaArchivo, registro, claveHexadecimal);
  await assert.rejects(
    crearProveedor(rutaArchivo, claveHexadecimal).listarTenants(),
    /base MySQL distinta/,
  );
}

function alterarEtiqueta(cifrado: string): string {
  const valor: unknown = JSON.parse(cifrado);
  if (
    typeof valor !== "object" ||
    valor === null ||
    !("version" in valor) ||
    typeof valor.version !== "number" ||
    !("iv" in valor) ||
    typeof valor.iv !== "string" ||
    !("etiqueta" in valor) ||
    typeof valor.etiqueta !== "string" ||
    !("contenido" in valor) ||
    typeof valor.contenido !== "string"
  ) {
    throw new Error("La prueba recibió un sobre cifrado inválido");
  }

  const sobre: SobreCifrado = {
    version: valor.version,
    iv: valor.iv,
    etiqueta: valor.etiqueta,
    contenido: valor.contenido,
  };
  const primerCaracter = sobre.etiqueta[0];
  if (!primerCaracter) throw new Error("La etiqueta cifrada está vacía");
  sobre.etiqueta = `${primerCaracter === "A" ? "B" : "A"}${sobre.etiqueta.slice(1)}`;
  return JSON.stringify(sobre);
}

async function verificarArchivoAlterado(
  directorio: string,
  claveHexadecimal: string,
): Promise<void> {
  const rutaArchivo = path.join(directorio, "registro-alterado.enc.json");
  const cifrado = cifrarRegistroLocal(JSON.stringify(crearRegistroFixture()), claveHexadecimal);
  await writeFile(rutaArchivo, `${alterarEtiqueta(cifrado)}\n`, { encoding: "utf8", flag: "wx" });
  await assert.rejects(
    crearProveedor(rutaArchivo, claveHexadecimal).listarTenants(),
    /No se pudo descifrar el registro local/,
  );
}

async function verificarClaveIncorrecta(
  directorio: string,
  claveHexadecimal: string,
): Promise<void> {
  const rutaArchivo = path.join(directorio, "clave-incorrecta.enc.json");
  await guardarRegistro(rutaArchivo, crearRegistroFixture(), claveHexadecimal);
  const otraClave = randomBytes(32).toString("hex");
  await assert.rejects(
    crearProveedor(rutaArchivo, otraClave).listarTenants(),
    /No se pudo descifrar el registro local/,
  );
}

async function verificarInvalidacionDeCacheLocal(
  directorio: string,
  claveHexadecimal: string,
): Promise<void> {
  const rutaArchivo = path.join(directorio, "registro-invalidacion.enc.json");
  const registroInicial = crearRegistroFixture();
  await guardarRegistro(rutaArchivo, registroInicial, claveHexadecimal);
  const proveedorLocal = new ProveedorRegistroLocal({
    rutaArchivo,
    claveHexadecimal,
    ttlMs: 60_000,
  });
  const proveedorCacheado = new ProveedorRegistroCacheado(proveedorLocal, 60_000);

  assert.equal((await proveedorCacheado.resolverPorId("tenant-local-uno"))?.tenant.estado, "ACTIVO");
  const registroActualizado = crearRegistroFixture();
  const tenantActualizado = registroActualizado.tenants[0];
  assert.ok(tenantActualizado);
  tenantActualizado.estado = "SUSPENDIDO";
  await writeFile(
    rutaArchivo,
    `${cifrarRegistroLocal(JSON.stringify(registroActualizado), claveHexadecimal)}\n`,
    { encoding: "utf8", flag: "w" },
  );

  assert.equal((await proveedorCacheado.resolverPorId("tenant-local-uno"))?.tenant.estado, "ACTIVO");
  proveedorCacheado.invalidar();
  assert.equal((await proveedorCacheado.resolverPorId("tenant-local-uno"))?.tenant.estado, "SUSPENDIDO");
}

async function main(): Promise<void> {
  const directorio = await mkdtemp(path.join(os.tmpdir(), "gestion-stock-registro-local-"));
  const claveHexadecimal = randomBytes(32).toString("hex");

  try {
    await verificarDosTenantsYCredenciales(directorio, claveHexadecimal);
    await verificarDominiosDuplicados(directorio, claveHexadecimal);
    await verificarReferenciasDuplicadas(directorio, claveHexadecimal);
    await verificarDestinosFisicosDuplicados(directorio, claveHexadecimal);
    await verificarArchivoAlterado(directorio, claveHexadecimal);
    await verificarClaveIncorrecta(directorio, claveHexadecimal);
    await verificarInvalidacionDeCacheLocal(directorio, claveHexadecimal);
    console.log(
      "Registro local cifrado: dos tenants, credenciales, unicidad, invalidación de caché y errores de integridad verificados.",
    );
  } finally {
    await rm(directorio, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
