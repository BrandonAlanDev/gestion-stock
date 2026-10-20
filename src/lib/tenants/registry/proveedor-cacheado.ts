import "server-only";

import { z } from "zod";
import { normalizarHostname } from "../normalizar-hostname";
import type {
  CredencialesBaseTenant,
  TenantRegistryEntry,
  TenantRegistryProvider,
} from "./types";

type ValorCacheado<T> = { valor: T; venceEn?: number };

const entradaSchema = z.object({
  tenant: z.object({
    id: z.string().trim().min(1).max(128).regex(/^[a-z0-9_-]+$/i),
    nombre: z.string().trim().min(1),
    slug: z.string().trim().min(1).max(63).regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/),
    dominio: z.string().trim().nullable(),
    estado: z.enum(["PROVISIONING", "ACTIVO", "SUSPENDIDO", "INACTIVO", "ERROR"]),
  }),
  dominios: z.array(z.string().trim().min(1)),
  referenciaBase: z.string().trim(),
  versionCredenciales: z.string().trim().min(1),
  versionCache: z.number().int().nonnegative().optional(),
});

const credencialesSchema = z.object({
  host: z.string().trim().min(1),
  puerto: z.number().int().min(1).max(65535),
  usuario: z.string().trim().min(1),
  contrasena: z.string(),
  base: z.string().trim().min(1),
  ssl: z.boolean(),
});

/** Conserva por proceso las respuestas validadas de Core durante un plazo breve. */
export class ProveedorRegistroCacheado implements TenantRegistryProvider {
  private readonly porHostname = new Map<string, ValorCacheado<TenantRegistryEntry | null>>();
  private readonly porId = new Map<string, ValorCacheado<TenantRegistryEntry | null>>();
  private readonly estados = new Map<string, ValorCacheado<number | void>>();
  private readonly credenciales = new Map<string, CredencialesBaseTenant>();
  private listado?: ValorCacheado<TenantRegistryEntry[]>;
  private readonly cargas = new Map<string, Promise<unknown>>();
  private generacionCache = 0;

  constructor(
    private readonly origen: TenantRegistryProvider,
    private readonly ttlMs = 30_000,
    private readonly ahora: () => number = Date.now,
  ) {}

  async resolverPorHostname(hostname: string): Promise<TenantRegistryEntry | null> {
    const host = normalizarHostname(hostname);
    if (!host) return null;
    const generacion = this.generacionCache;
    const entrada = await this.obtener(`host:${host}`, this.porHostname, () =>
      this.origen.resolverPorHostname(host).then((valor) => {
        const entrada = validarEntradaNullable(valor);
        if (entrada && !entrada.dominios.includes(host)) {
          throw new Error("El directorio resolvió el dominio a un tenant distinto");
        }
        return entrada;
      }),
    );
    const claveId = entrada ? `id:${entrada.tenant.id}` : null;
    const porId = claveId ? this.porId.get(claveId) : undefined;
    if (entrada && claveId && generacion === this.generacionCache &&
        (!porId || porId.venceEn === undefined || this.ahora() >= porId.venceEn)) {
      this.porId.set(claveId, { valor: clonarEntrada(entrada), venceEn: this.ahora() + this.ttlMs });
    }
    return entrada;
  }

  resolverPorId(tenantId: string): Promise<TenantRegistryEntry | null> {
    const id = tenantId.trim();
    if (!id) return Promise.resolve(null);
    return this.obtener(`id:${id}`, this.porId, () =>
      this.origen.resolverPorId(id).then((valor) => {
        const entrada = validarEntradaNullable(valor);
        if (entrada && entrada.tenant.id !== id) {
          throw new Error("El directorio resolvió el ID a un tenant distinto");
        }
        return entrada;
      }),
    );
  }

  async resolverCredenciales(
    referenciaBase: string,
    versionCredenciales: string,
    tenantId?: string,
  ): Promise<CredencialesBaseTenant> {
    const clave = JSON.stringify([tenantId, referenciaBase, versionCredenciales]);
    const existente = this.credenciales.get(clave);
    if (existente) return { ...existente };
    const generacion = this.generacionCache;
    const credenciales = await this.cargar(`credenciales:${clave}`, async () => {
      const valor = await this.origen.resolverCredenciales(referenciaBase, versionCredenciales, tenantId);
      const validado = credencialesSchema.safeParse(valor);
      if (!validado.success) throw new Error("El proveedor devolvió credenciales de tenant inválidas");
      return validado.data;
    });
    if (generacion !== this.generacionCache) {
      return this.resolverCredenciales(referenciaBase, versionCredenciales, tenantId);
    }
    this.credenciales.set(clave, { ...credenciales });
    return { ...credenciales };
  }

  async verificarAcceso(tenantId: string): Promise<number | void> {
    const vigente = this.estados.get(tenantId);
    if (vigente && vigente.venceEn !== undefined && this.ahora() < vigente.venceEn) {
      return vigente.valor;
    }
    const generacion = this.generacionCache;
    const version = await this.cargar(`estado:${tenantId}`, async () => {
      const version = await (this.origen.verificarAcceso?.(tenantId) ?? Promise.resolve());
      if (generacion === this.generacionCache) {
        this.estados.set(tenantId, { valor: version, venceEn: this.ahora() + this.ttlMs });
      }
      return version;
    });
    if (generacion !== this.generacionCache) return this.verificarAcceso(tenantId);
    return version;
  }

  async listarTenants(): Promise<TenantRegistryEntry[]> {
    if (this.listado && this.listado.venceEn !== undefined && this.ahora() < this.listado.venceEn) {
      return this.listado.valor.map(clonarEntrada);
    }
    const generacion = this.generacionCache;
    const tenants = await this.cargar("lista", async () =>
      validarLista(await this.origen.listarTenants()),
    );
    if (generacion !== this.generacionCache) return this.listarTenants();
    this.listado = { valor: tenants.map(clonarEntrada), venceEn: this.ahora() + this.ttlMs };
    return tenants.map(clonarEntrada);
  }

  invalidar(): void {
    this.generacionCache += 1;
    this.porHostname.clear();
    this.porId.clear();
    this.estados.clear();
    this.credenciales.clear();
    this.listado = undefined;
    this.cargas.clear();
    this.origen.invalidarCache?.();
  }

  private async obtener<T extends TenantRegistryEntry | null>(
    clave: string,
    mapa: Map<string, ValorCacheado<T>>,
    cargar: () => Promise<T>,
  ): Promise<T> {
    const existente = mapa.get(clave);
    if (existente && (existente.venceEn === undefined || this.ahora() < existente.venceEn)) {
      return existente.valor ? (clonarEntrada(existente.valor) as T) : null as T;
    }

    const generacion = this.generacionCache;
    const valor = await this.cargar(clave, cargar);
    if (generacion !== this.generacionCache) return this.obtener(clave, mapa, cargar);
    mapa.set(clave, { valor, venceEn: this.ahora() + this.ttlMs });
    return valor ? (clonarEntrada(valor) as T) : null as T;
  }

  private async cargar<T>(clave: string, cargar: () => Promise<T>): Promise<T> {
    const enCurso = this.cargas.get(clave) as Promise<T> | undefined;
    if (enCurso) return enCurso;

    const carga = cargar();
    this.cargas.set(clave, carga);
    try {
      return await carga;
    } finally {
      if (this.cargas.get(clave) === carga) this.cargas.delete(clave);
    }
  }
}

function clonarEntrada(entrada: TenantRegistryEntry): TenantRegistryEntry {
  return {
    ...entrada,
    tenant: { ...entrada.tenant },
    dominios: [...entrada.dominios],
  };
}

function validarEntrada(valor: unknown): TenantRegistryEntry {
  const resultado = entradaSchema.safeParse(valor);
  if (!resultado.success) throw new Error("El proveedor devolvió metadatos de tenant inválidos");

  const dominios = resultado.data.dominios.map((dominio) => {
    const normalizado = normalizarHostname(dominio);
    if (!normalizado || normalizado !== dominio) {
      throw new Error("El proveedor devolvió un dominio de tenant inválido");
    }
    return normalizado;
  });
  if (resultado.data.tenant.estado === "ACTIVO" && !resultado.data.referenciaBase) {
    throw new Error("El tenant activo carece de referencia de conexión");
  }
  if (new Set(dominios).size !== dominios.length) {
    throw new Error("El proveedor devolvió dominios duplicados para un tenant");
  }

  let dominio = resultado.data.tenant.dominio;
  if (dominio !== null) {
    const normalizado = normalizarHostname(dominio);
    if (!normalizado || normalizado !== dominio || !dominios.includes(normalizado)) {
      throw new Error("El dominio principal no pertenece al tenant resuelto");
    }
    dominio = normalizado;
  }

  return {
    ...resultado.data,
    tenant: { ...resultado.data.tenant, dominio },
    dominios,
  } as TenantRegistryEntry;
}

function validarEntradaNullable(valor: TenantRegistryEntry | null): TenantRegistryEntry | null {
  return valor === null ? null : validarEntrada(valor);
}

function validarLista(valor: unknown): TenantRegistryEntry[] {
  if (!Array.isArray(valor)) throw new Error("El proveedor devolvió un listado de tenants inválido");
  const tenants = valor.map(validarEntrada);
  const ids = new Set<string>();
  const referencias = new Set<string>();
  const dominios = new Set<string>();

  for (const entrada of tenants) {
    if (ids.has(entrada.tenant.id)) throw new Error("El directorio devolvió IDs de tenant duplicados");
    if (entrada.referenciaBase && referencias.has(entrada.referenciaBase)) {
      throw new Error("El directorio asignó una referencia de conexión a más de un tenant");
    }
    ids.add(entrada.tenant.id);
    if (entrada.referenciaBase) referencias.add(entrada.referenciaBase);
    for (const dominio of entrada.dominios) {
      if (dominios.has(dominio)) throw new Error("El directorio asignó un dominio a más de un tenant");
      dominios.add(dominio);
    }
  }

  return tenants;
}
