import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import type { Pool } from "mariadb";
import { ProveedorBaseCore } from "../src/lib/tenants/registry/proveedor-base-core";

const secreto = "clave-de-prueba";
const uri = "mysql://usuario:clave@db.ejemplo.com:3306/cliente";
const iv = Buffer.alloc(12, 1);
const cifrador = createCipheriv("aes-256-gcm", createHash("sha256").update(secreto).digest(), iv);
const datos = Buffer.concat([cifrador.update(uri, "utf8"), cifrador.final()]);
const cifrado = [iv, cifrador.getAuthTag(), datos].map((parte) => parte.toString("base64")).join(":");
let estado = "ACTIVO";
let auditar = true;
let auditorias = 0;

const pool = {
  async query(sql: string, parametros: unknown[]): Promise<unknown> {
    if (sql.includes("INSERT INTO registros_auditoria")) {
      auditorias += 1;
      assert.equal(parametros[2], "gestion-stock");
      if (parametros[3] === "RESOLVER_CREDENCIALES_CLIENTE") {
        assert.equal(parametros[1], null);
        assert.equal(parametros[5], "base-1");
      } else {
        assert.equal(parametros[1], "core-1");
        assert.equal(parametros[5], "tenant-1");
      }
      if (!auditar) throw new Error("Auditoría no disponible");
      return { affectedRows: 1 };
    }
    assert.equal(parametros[0], "gestion-stock");
    if (sql.includes("SELECT 'tenant' AS tipo") && sql.includes("AS cifrado")) {
      if (parametros[1] === "cliente-1" && parametros[7] === "base-1") {
        return [{ tipo: "cliente", idInterno: "base-1", referencia: "base-1",
          version: BigInt(1), cifrado, versionClave: BigInt(1) }];
      }
      if (parametros[1] !== "tenant-1" || parametros[4] !== "ref-1" || estado !== "ACTIVO") return [];
      return [{ tipo: "tenant", idInterno: "core-1", referencia: "ref-1",
        version: 2, cifrado, versionClave: 1 }];
    }
    if (sql.includes("SELECT 'tenant' AS tipo")) {
      const filtro = parametros[1];
      if (filtro && filtro !== "uno.ejemplo.com" && filtro !== "tenant-1") return [];
      return [{ tipo: "tenant", idInterno: "core-1", id: "tenant-1",
        nombre: "Uno", slug: "uno", estado, versionCache: 3,
        versionCredenciales: 2, referenciaBase: estado === "ACTIVO" ? "ref-1" : null,
        dominio: "uno.ejemplo.com" }];
    }
    if (sql.includes("SELECT 'cliente' AS tipo")) {
      const filtro = parametros[1];
      if (filtro && filtro !== "dos.ejemplo.com" && filtro !== "cliente-1") return [];
      return [{ tipo: "cliente", idInterno: "base-1", id: "cliente-1",
        nombre: "Dos", slug: "dos", estado: "ACTIVO", versionCache: 1,
        versionCredenciales: BigInt(1), referenciaBase: "base-1", dominio: "dos.ejemplo.com" }];
    }
    return [];
  },
} as unknown as Pick<Pool, "query">;

async function verificar(): Promise<void> {
  const proveedor = new ProveedorBaseCore(
    "mysql://lector:clave@localhost:3306/logabyte_core",
    "gestion-stock", secreto, pool,
  );
  assert.equal((await proveedor.resolverPorHostname("uno.ejemplo.com"))?.tenant.id, "tenant-1");
  assert.equal((await proveedor.resolverPorHostname("dos.ejemplo.com"))?.tenant.id, "cliente-1");
  assert.equal(await proveedor.resolverPorHostname("desconocido.ejemplo.com"), null);
  assert.equal((await proveedor.listarTenants()).length, 2);
  assert.equal(await proveedor.verificarAcceso("tenant-1"), 3);
  assert.deepEqual(await proveedor.resolverCredenciales("ref-1", "2", "tenant-1"), {
    host: "db.ejemplo.com", puerto: 3306, usuario: "usuario", contrasena: "clave",
    base: "cliente", ssl: true,
  });
  assert.equal(auditorias, 1);
  assert.equal((await proveedor.resolverCredenciales("base-1", "1", "cliente-1")).base, "cliente");
  assert.equal(auditorias, 2);
  await assert.rejects(proveedor.resolverCredenciales("otra", "2", "tenant-1"));
  estado = "SUSPENDIDO";
  await assert.rejects(proveedor.verificarAcceso("tenant-1"));
  await assert.rejects(proveedor.resolverCredenciales("ref-1", "2", "tenant-1"));
  estado = "ACTIVO";
  auditar = false;
  await assert.rejects(proveedor.resolverCredenciales("ref-1", "2", "tenant-1"));
  console.log("Proveedor directo de Core verificado");
}

void verificar();
