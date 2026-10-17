import "server-only";

import { z } from "zod";
import type {
  CredencialesBaseTenant,
  LogabyteCoreGateway,
  TenantCredentialResolver,
  TenantRegistryEntry,
} from "./types";

const estadoSchema = z.enum(["PROVISIONING", "ACTIVO", "SUSPENDIDO", "INACTIVO", "ERROR"]);
const tenantBaseSchema = z.object({
  id: z.string().min(1).max(191),
  nombre: z.string().min(1),
  slug: z.string().min(1),
  estado: estadoSchema,
  versionCache: z.number().int().nonnegative(),
  versionCredenciales: z.number().int().nonnegative(),
  referenciaCredencial: z.string().min(1).nullable(),
});
const tenantHostSchema = tenantBaseSchema.extend({
  producto: z.string().min(1),
  hostname: z.string().min(1),
});
const tenantIdSchema = tenantBaseSchema.extend({
  producto: z.string().min(1),
  dominios: z.array(z.string()),
});
const tenantListaSchema = tenantBaseSchema.extend({ dominios: z.array(z.string()) });
const estadoRespuestaSchema = z.object({
  tenantId: z.string().min(1),
  estado: estadoSchema,
  versionCache: z.number().int().nonnegative(),
});
const credencialRespuestaSchema = z.object({
  tenantId: z.string().min(1),
  referencia: z.string().min(1),
  version: z.number().int().positive(),
  uri: z.string().min(1),
});
const errorSchema = z.object({ codigo: z.string(), mensaje: z.string() });
const sobreSchema = z.object({
  datos: z.unknown(),
  error: errorSchema.nullable(),
  metadatos: z.object({ versionApi: z.literal("v1"), solicitudId: z.string().min(1) }).passthrough(),
});
const paginaSchema = z.object({
  limite: z.number().int().min(1).max(100),
  siguienteCursor: z.string().nullable(),
  hayMas: z.boolean(),
});

export type CodigoErrorCore =
  | "CONFIGURACION" | "RED" | "TIMEOUT" | "RESPUESTA_INVALIDA"
  | "CREDENCIAL_INVALIDA" | "PERMISO_INSUFICIENTE" | "NO_ENCONTRADO"
  | "CONFLICTO" | "LIMITE_EXCEDIDO" | "CORE_NO_DISPONIBLE" | "SOLICITUD_INVALIDA";

export class ErrorLogabyteCore extends Error {
  constructor(
    readonly codigo: CodigoErrorCore,
    readonly estadoHttp?: number,
  ) {
    super(`Logabyte Core: ${codigo}`);
    this.name = "ErrorLogabyteCore";
  }
}

export interface ConfiguracionLogabyteCore {
  urlBase: string;
  token: string;
  producto: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/** Cliente privado: no registra cuerpos, URLs con secretos ni errores de transporte. */
export class ClienteLogabyteCore implements LogabyteCoreGateway, TenantCredentialResolver {
  private readonly base: URL;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly configuracion: ConfiguracionLogabyteCore) {
    let base: URL;
    try { base = new URL(configuracion.urlBase); }
    catch { throw new ErrorLogabyteCore("CONFIGURACION"); }
    if (
      (base.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && base.protocol === "http:")) ||
      base.username || base.password || base.search || base.hash || base.pathname !== "/" ||
      !/^lbcore_[A-Za-z0-9_-]{4,16}\.[A-Za-z0-9_-]{32,128}$/.test(configuracion.token) ||
      !configuracion.producto.trim() ||
      (configuracion.timeoutMs !== undefined &&
        (!Number.isInteger(configuracion.timeoutMs) || configuracion.timeoutMs < 3_000 || configuracion.timeoutMs > 30_000))
    ) throw new ErrorLogabyteCore("CONFIGURACION");
    this.base = base;
    this.fetchImpl = configuracion.fetchImpl ?? fetch;
  }

  private async consultar(ruta: string, timeoutMs = this.configuracion.timeoutMs ?? 3_000): Promise<{
    datos: unknown;
    metadatos: Record<string, unknown>;
  } | null> {
    let respuesta: Response;
    try {
      respuesta = await this.fetchImpl(new URL(ruta, this.base), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.configuracion.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new ErrorLogabyteCore(error instanceof Error && error.name === "TimeoutError" ? "TIMEOUT" : "RED");
    }

    let cuerpo: unknown;
    try { cuerpo = await respuesta.json(); }
    catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        throw new ErrorLogabyteCore("TIMEOUT");
      }
      throw new ErrorLogabyteCore("RESPUESTA_INVALIDA", respuesta.status);
    }
    const sobre = sobreSchema.safeParse(cuerpo);
    if (!sobre.success) throw new ErrorLogabyteCore("RESPUESTA_INVALIDA", respuesta.status);
    if (!respuesta.ok) {
      if (respuesta.status === 404 && sobre.data.error?.codigo === "NO_ENCONTRADO") return null;
      const codigos: Record<number, CodigoErrorCore> = {
        400: "SOLICITUD_INVALIDA", 401: "CREDENCIAL_INVALIDA", 403: "PERMISO_INSUFICIENTE",
        409: "CONFLICTO", 429: "LIMITE_EXCEDIDO", 503: "CORE_NO_DISPONIBLE",
      };
      const codigo = codigos[respuesta.status];
      if (!codigo || sobre.data.error?.codigo !== codigo || sobre.data.datos !== null) {
        throw new ErrorLogabyteCore("RESPUESTA_INVALIDA", respuesta.status);
      }
      throw new ErrorLogabyteCore(codigo, respuesta.status);
    }
    if (respuesta.status !== 200) throw new ErrorLogabyteCore("RESPUESTA_INVALIDA", respuesta.status);
    if (sobre.data.error !== null || sobre.data.datos === null) {
      throw new ErrorLogabyteCore("RESPUESTA_INVALIDA", respuesta.status);
    }
    return { datos: sobre.data.datos, metadatos: sobre.data.metadatos };
  }

  private convertir(fila: z.infer<typeof tenantBaseSchema>, dominios: string[]): TenantRegistryEntry {
    if (fila.estado === "ACTIVO" && !fila.referenciaCredencial) {
      throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
    }
    return {
      tenant: {
        id: fila.id,
        nombre: fila.nombre,
        slug: fila.slug,
        dominio: dominios[0] ?? null,
        estado: fila.estado,
      },
      dominios,
      referenciaBase: fila.referenciaCredencial ?? "",
      versionCredenciales: String(fila.versionCredenciales),
      versionCache: fila.versionCache,
    };
  }

  async resolverPorHostname(hostname: string): Promise<TenantRegistryEntry | null> {
    const respuesta = await this.consultar(`/api/internal/v1/tenants/hostname?hostname=${encodeURIComponent(hostname)}`);
    if (!respuesta) return null;
    const fila = tenantHostSchema.safeParse(respuesta.datos);
    if (!fila.success || fila.data.producto !== this.configuracion.producto || fila.data.hostname !== hostname) {
      throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
    }
    return this.convertir(fila.data, [hostname]);
  }

  async resolverPorId(tenantId: string): Promise<TenantRegistryEntry | null> {
    const respuesta = await this.consultar(`/api/internal/v1/tenants/${encodeURIComponent(tenantId)}`);
    if (!respuesta) return null;
    const fila = tenantIdSchema.safeParse(respuesta.datos);
    if (!fila.success || fila.data.producto !== this.configuracion.producto || fila.data.id !== tenantId) {
      throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
    }
    return this.convertir(fila.data, fila.data.dominios);
  }

  async listarTenants(): Promise<TenantRegistryEntry[]> {
    const entradas: TenantRegistryEntry[] = [];
    const cursores = new Set<string>();
    let cursor: string | null = null;
    do {
      const ruta = `/api/internal/v1/tenants?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const respuesta = await this.consultar(ruta);
      if (!respuesta) throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
      const pagina = z.array(tenantListaSchema).safeParse(respuesta.datos);
      const meta = paginaSchema.safeParse(respuesta.metadatos);
      if (!pagina.success || !meta.success || pagina.data.length > 100 || meta.data.limite !== 100) {
        throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
      }
      entradas.push(...pagina.data.map((fila) => this.convertir(fila, fila.dominios)));
      if (!meta.data.hayMas) return entradas;
      const siguiente = meta.data.siguienteCursor;
      if (!siguiente || cursores.has(siguiente) || pagina.data.at(-1)?.id !== siguiente) {
        throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
      }
      cursores.add(siguiente);
      cursor = siguiente;
    } while (true);
  }

  async verificarAcceso(tenantId: string): Promise<number> {
    const respuesta = await this.consultar(`/api/internal/v1/tenants/${encodeURIComponent(tenantId)}/estado`);
    if (!respuesta) throw new ErrorLogabyteCore("NO_ENCONTRADO", 404);
    const estado = estadoRespuestaSchema.safeParse(respuesta.datos);
    if (!estado.success || estado.data.tenantId !== tenantId) throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
    if (estado.data.estado !== "ACTIVO") throw new ErrorLogabyteCore("CONFLICTO", 409);
    return estado.data.versionCache;
  }

  async resolver(
    referenciaBase: string,
    versionCredenciales: string,
    tenantId?: string,
  ): Promise<CredencialesBaseTenant> {
    if (!tenantId || !/^[1-9]\d*$/.test(versionCredenciales)) throw new ErrorLogabyteCore("CONFIGURACION");
    const ruta = `/api/internal/v1/tenants/${encodeURIComponent(tenantId)}/credenciales?referencia=${encodeURIComponent(referenciaBase)}&version=${encodeURIComponent(versionCredenciales)}`;
    const respuesta = await this.consultar(ruta, Math.max(5_000, this.configuracion.timeoutMs ?? 3_000));
    if (!respuesta) throw new ErrorLogabyteCore("NO_ENCONTRADO", 404);
    const credencial = credencialRespuestaSchema.safeParse(respuesta.datos);
    if (
      !credencial.success || credencial.data.tenantId !== tenantId ||
      credencial.data.referencia !== referenciaBase || String(credencial.data.version) !== versionCredenciales
    ) throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
    return analizarUriMysql(credencial.data.uri);
  }
}

function analizarUriMysql(uri: string): CredencialesBaseTenant {
  let valor: URL;
  try { valor = new URL(uri); }
  catch { throw new ErrorLogabyteCore("RESPUESTA_INVALIDA"); }
  const base = valor.pathname.slice(1);
  const puerto = valor.port ? Number(valor.port) : 3306;
  if (
    valor.protocol !== "mysql:" || !valor.hostname || !valor.username ||
    !base || base.includes("/") || valor.hash ||
    !Number.isInteger(puerto) || puerto < 1 || puerto > 65535
  ) throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
  try {
    return {
      host: valor.hostname,
      puerto,
      usuario: decodeURIComponent(valor.username),
      contrasena: decodeURIComponent(valor.password),
      base: decodeURIComponent(base),
      ssl: true,
    };
  } catch {
    throw new ErrorLogabyteCore("RESPUESTA_INVALIDA");
  }
}
