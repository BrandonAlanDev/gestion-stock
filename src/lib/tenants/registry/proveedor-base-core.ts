import "server-only";

import { createDecipheriv, createHash, randomUUID } from "node:crypto";
import mariadb, { type Pool } from "mariadb";
import { z } from "zod";
import { analizarUriMysql } from "./analizar-uri-mysql";
import type { CredencialesBaseTenant, TenantRegistryEntry, TenantRegistryProvider } from "./types";

// MariaDB devuelve algunas constantes numéricas de SELECT como bigint.
const enteroSql = z.union([
  z.number().int().nonnegative(),
  z.bigint().min(BigInt(0)).max(BigInt(Number.MAX_SAFE_INTEGER)),
]).transform(Number);

const filaSchema = z.object({
  tipo: z.enum(["tenant", "cliente"]),
  idInterno: z.string().min(1),
  id: z.string().min(1),
  nombre: z.string().min(1),
  slug: z.string().min(1),
  estado: z.enum(["PROVISIONING", "ACTIVO", "SUSPENDIDO", "INACTIVO", "ERROR"]),
  versionCache: enteroSql,
  versionCredenciales: enteroSql,
  referenciaBase: z.string().nullable(),
  dominio: z.string().nullable(),
});

const credencialSchema = z.object({
  tipo: z.enum(["tenant", "cliente"]),
  idInterno: z.string().min(1),
  referencia: z.string().min(1),
  version: enteroSql.refine((valor) => valor > 0),
  cifrado: z.string().min(1),
  versionClave: enteroSql.refine((valor) => valor > 0),
});

type Fila = z.infer<typeof filaSchema>;
type Filtro = { campo: "hostname" | "id"; valor: string };

/** Lee el catálogo de Core sin pasar por su API. La cuenta SQL debe limitarse a Core. */
export class ProveedorBaseCore implements TenantRegistryProvider {
  private readonly pool: Pick<Pool, "query">;

  constructor(
    urlConexion: string,
    private readonly producto: string,
    private readonly secretoCifrado: string,
    pool?: Pick<Pool, "query">,
  ) {
    let url: URL;
    try { url = new URL(urlConexion); }
    catch { throw new Error("LOGABYTE_CORE_DATABASE_URL no es una URL válida"); }
    const base = decodeURIComponent(url.pathname.slice(1));
    const puerto = url.port ? Number(url.port) : 3306;
    if (
      url.protocol !== "mysql:" || !url.hostname || !url.username ||
      base !== "logabyte_core" || !Number.isInteger(puerto) || puerto < 1 || puerto > 65535 ||
      !producto.trim() || !secretoCifrado.trim() || url.hash ||
      (process.env.NODE_ENV === "production" && url.searchParams.get("sslaccept") !== "strict")
    ) throw new Error("Configuración inválida de la base de Logabyte Core");
    this.secretoCifrado = secretoCifrado.trim();
    this.pool = pool ?? mariadb.createPool({
      host: url.hostname,
      port: puerto,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: base,
      ssl: url.searchParams.get("sslaccept") === "strict" ? { rejectUnauthorized: true } : false,
      connectionLimit: 3,
      connectTimeout: 10_000,
      acquireTimeout: 10_000,
      idleTimeout: 60,
    });
  }

  async resolverPorHostname(hostname: string): Promise<TenantRegistryEntry | null> {
    const entradas = await this.buscar({ campo: "hostname", valor: hostname });
    if (entradas.length > 1) throw new Error("El dominio está asignado a más de un cliente");
    return entradas[0] ?? null;
  }

  async resolverPorId(tenantId: string): Promise<TenantRegistryEntry | null> {
    const entradas = await this.buscar({ campo: "id", valor: tenantId });
    if (entradas.length > 1) throw new Error("El ID está asignado a más de un cliente");
    return entradas[0] ?? null;
  }

  listarTenants(): Promise<TenantRegistryEntry[]> {
    return this.buscar();
  }

  async verificarAcceso(tenantId: string): Promise<number> {
    const entrada = await this.resolverPorId(tenantId);
    if (!entrada || entrada.tenant.estado !== "ACTIVO") {
      throw new Error("La organización no está disponible");
    }
    return entrada.versionCache ?? 0;
  }

  async resolverCredenciales(
    referenciaBase: string,
    versionCredenciales: string,
    tenantId?: string,
  ): Promise<CredencialesBaseTenant> {
    if (!tenantId || !/^[1-9]\d*$/.test(versionCredenciales)) {
      throw new Error("Identidad de conexión inválida");
    }
    const version = Number(versionCredenciales);
    if (!Number.isSafeInteger(version)) throw new Error("Versión de conexión inválida");
    const filas = await this.consultar(`
      SELECT 'tenant' AS tipo, t.id AS idInterno, i.referencia_credencial AS referencia,
        i.version_credencial AS version, i.credencial_cifrada AS cifrado,
        i.version_clave_cifrado AS versionClave
      FROM tenants t
      JOIN productos_saas p ON p.id = t.producto_id AND p.slug = ? AND p.activo = 1
      JOIN instancias_bases_datos i ON i.id = t.instancia_base_datos_id
        AND i.tenant_id = t.id AND i.activa = 1 AND i.verificada_en IS NOT NULL
      WHERE t.identidad_producto = ? AND t.estado = 'ACTIVO'
        AND t.version_credenciales = ? AND i.version_credencial = ?
        AND i.referencia_credencial = ?
      UNION ALL
      SELECT 'cliente' AS tipo, b.id AS idInterno, b.id AS referencia, 1 AS version,
        b.credencial_cifrada AS cifrado, 1 AS versionClave
      FROM bases_datos_clientes b
      JOIN productos_saas p ON p.id = b.producto_id AND p.slug = ? AND p.activo = 1
      JOIN organizaciones o ON o.id = b.organizacion_id AND o.producto_id = p.id
      WHERE b.identidad_producto = ? AND b.verificada_en IS NOT NULL AND b.id = ?
    `, [this.producto, tenantId, version, version, referenciaBase,
      this.producto, tenantId, referenciaBase]);
    const validado = z.array(credencialSchema).safeParse(filas);
    if (!validado.success || validado.data.length !== 1 ||
      validado.data[0].referencia !== referenciaBase || validado.data[0].version !== version) {
      throw new Error("Core no confirmó la credencial solicitada");
    }
    const fila = validado.data[0];
    if (fila.versionClave !== 1) throw new Error("Versión de cifrado no compatible");
    const uri = this.descifrar(fila.cifrado);
    const credenciales = analizarUriMysql(uri);
    // La auditoría se confirma antes de entregar las credenciales al pool del cliente.
    await this.registrarAuditoria(`
      INSERT INTO registros_auditoria
        (id, tenant_id, actor_tipo, actor_id, accion, entidad, entidad_id, resultado, detalle_seguro, creado_en)
      VALUES (?, ?, 'SERVICIO', ?, ?, ?, ?, 'EXITO', ?, NOW(3))
    `, [randomUUID(), fila.tipo === "cliente" ? null : fila.idInterno,
      this.producto, fila.tipo === "cliente"
        ? "RESOLVER_CREDENCIALES_CLIENTE" : "RESOLVER_CREDENCIALES",
      fila.tipo === "cliente" ? "base_datos_cliente" : "instancia_base_datos",
      fila.tipo === "cliente" ? fila.idInterno : tenantId,
      JSON.stringify({ referencia: referenciaBase, version })]);
    return credenciales;
  }

  private async buscar(filtro?: Filtro): Promise<TenantRegistryEntry[]> {
    const condicionTenant = filtro?.campo === "hostname"
      ? "AND d.hostname = ?" : filtro?.campo === "id" ? "AND t.identidad_producto = ?" : "";
    const condicionCliente = filtro?.campo === "hostname"
      ? "AND d.hostname = ?" : filtro?.campo === "id" ? "AND b.identidad_producto = ?" : "";
    const parametros = filtro ? [this.producto, filtro.valor] : [this.producto];
    const [tenants, clientes] = await Promise.all([
      this.consultar(`
        SELECT 'tenant' AS tipo, t.id AS idInterno, COALESCE(t.identidad_producto, t.id) AS id,
          t.nombre, t.slug, t.estado, t.version_cache AS versionCache,
          t.version_credenciales AS versionCredenciales,
          CASE WHEN t.estado = 'ACTIVO' AND i.activa = 1 AND i.verificada_en IS NOT NULL
            AND i.version_credencial = t.version_credenciales THEN i.referencia_credencial
            ELSE NULL END AS referenciaBase, d.hostname AS dominio
        FROM tenants t
        JOIN productos_saas p ON p.id = t.producto_id AND p.slug = ? AND p.activo = 1
        LEFT JOIN instancias_bases_datos i ON i.id = t.instancia_base_datos_id AND i.tenant_id = t.id
        LEFT JOIN dominios_tenant d ON d.tenant_id = t.id AND d.verificado = 1
        WHERE 1 = 1 ${condicionTenant}
      `, parametros),
      this.consultar(`
        SELECT 'cliente' AS tipo, b.id AS idInterno, b.identidad_producto AS id,
          o.nombre, o.slug, 'ACTIVO' AS estado, b.version_cache AS versionCache,
          1 AS versionCredenciales, b.id AS referenciaBase, d.hostname AS dominio
        FROM bases_datos_clientes b
        JOIN productos_saas p ON p.id = b.producto_id AND p.slug = ? AND p.activo = 1
        JOIN organizaciones o ON o.id = b.organizacion_id AND o.producto_id = p.id
        LEFT JOIN dominios_bases_clientes d ON d.base_datos_id = b.id
        WHERE b.verificada_en IS NOT NULL ${condicionCliente}
      `, parametros),
    ]);
    const validado = z.array(filaSchema).safeParse([...tenants, ...clientes]);
    if (!validado.success) throw new Error("El catálogo de Core devolvió metadatos inválidos");
    const agrupadas = new Map<string, { fila: Fila; dominios: string[] }>();
    for (const fila of validado.data) {
      const clave = `${fila.tipo}:${fila.idInterno}`;
      const grupo = agrupadas.get(clave) ?? { fila, dominios: [] };
      if (fila.dominio && !grupo.dominios.includes(fila.dominio)) grupo.dominios.push(fila.dominio);
      agrupadas.set(clave, grupo);
    }
    return [...agrupadas.values()].map(({ fila, dominios }) => ({
      tenant: { id: fila.id, nombre: fila.nombre, slug: fila.slug,
        dominio: dominios.sort()[0] ?? null, estado: fila.estado },
      dominios: dominios.sort(),
      referenciaBase: fila.referenciaBase ?? "",
      versionCredenciales: String(fila.versionCredenciales),
      versionCache: fila.versionCache,
    }));
  }

  private async consultar(sql: string, parametros: unknown[]): Promise<unknown[]> {
    const resultado: unknown = await this.pool.query(sql, parametros);
    if (!Array.isArray(resultado)) throw new Error("Respuesta inválida de la base de Core");
    return resultado;
  }

  private async registrarAuditoria(sql: string, parametros: unknown[]): Promise<void> {
    const resultado: unknown = await this.pool.query(sql, parametros);
    const encabezado = z.object({ affectedRows: z.number().int().positive() }).safeParse(resultado);
    if (!encabezado.success) throw new Error("No se pudo registrar la auditoría de credenciales");
  }

  private descifrar(cifrado: string): string {
    const partes = cifrado.split(":");
    if (partes.length !== 3) throw new Error("Credencial cifrada inválida");
    const [iv, etiqueta, datos] = partes.map((parte) => Buffer.from(parte, "base64"));
    if (iv.length !== 12 || etiqueta.length !== 16 || datos.length === 0) {
      throw new Error("Credencial cifrada inválida");
    }
    const clave = createHash("sha256").update(this.secretoCifrado, "utf8").digest();
    const descifrador = createDecipheriv("aes-256-gcm", clave, iv);
    descifrador.setAuthTag(etiqueta);
    return Buffer.concat([descifrador.update(datos), descifrador.final()]).toString("utf8");
  }
}
