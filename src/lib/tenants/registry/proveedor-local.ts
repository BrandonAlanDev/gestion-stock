import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { normalizarHostname } from "../normalizar-hostname";
import { descifrarRegistroLocal } from "./cifrado-registro-local";
import type {
  CredencialesBaseTenant,
  TenantRegistryEntry,
  TenantRegistryProvider,
} from "./types";
import type { EstadoTenant } from "../../../types/tenants";

const ESTADOS = ["PROVISIONING", "ACTIVO", "SUSPENDIDO", "INACTIVO", "ERROR"] as const;

const tenantSchema = z.object({
  id: z.string().trim().min(1).max(128).regex(/^[a-z0-9_-]+$/i),
  nombre: z.string().trim().min(1),
  slug: z.string().trim().min(1).max(63).regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/),
  dominio: z.string().trim().min(1).nullable().default(null),
  dominios: z.array(z.string().trim().min(1)).min(1),
  estado: z.enum(ESTADOS),
  referenciaBase: z.string().trim().min(1),
  versionCredenciales: z.string().trim().min(1),
});

const credencialesSchema = z.object({
  host: z.string().trim().min(1),
  puerto: z.number().int().min(1).max(65535).default(3306),
  usuario: z.string().trim().min(1),
  contrasena: z.string(),
  base: z.string().trim().min(1),
  ssl: z.boolean().default(true),
});

const registroSchema = z.object({
  version: z.literal(1),
  tenants: z.array(tenantSchema),
  conexiones: z.record(z.string(), credencialesSchema),
});

type RegistroValidado = z.infer<typeof registroSchema>;

interface RegistroIndexado {
  porDominio: Map<string, TenantRegistryEntry>;
  porId: Map<string, TenantRegistryEntry>;
  porReferencia: Map<string, TenantRegistryEntry>;
  conexiones: Map<string, CredencialesBaseTenant>;
}

interface OpcionesProveedorLocal {
  rutaArchivo?: string;
  claveHexadecimal?: string;
  ttlMs?: number;
  ahora?: () => number;
}

function rutaRegistroPredeterminada(): string {
  return process.env.TENANT_REGISTRY_FILE ??
    path.join(process.cwd(), ".local", "tenant-registry.enc.json");
}

function claveRegistroPredeterminada(): string {
  return process.env.TENANT_REGISTRY_ENCRYPTION_KEY ?? "";
}

function validarRegistro(valor: unknown): RegistroValidado {
  const resultado = registroSchema.safeParse(valor);
  if (!resultado.success) {
    throw new Error("El registro local de tenants no cumple el esquema requerido");
  }

  const ids = new Set<string>();
  const dominios = new Set<string>();
  const referencias = new Set<string>();
  const bases = new Set<string>();

  for (const tenant of resultado.data.tenants) {
    if (ids.has(tenant.id)) throw new Error("El registro local contiene IDs de tenant duplicados");
    if (referencias.has(tenant.referenciaBase)) {
      throw new Error("Cada tenant local debe usar una referencia de base independiente");
    }

    ids.add(tenant.id);
    referencias.add(tenant.referenciaBase);

    if (!resultado.data.conexiones[tenant.referenciaBase]) {
      throw new Error("Un tenant local apunta a una referencia de base inexistente");
    }

    const credenciales = resultado.data.conexiones[tenant.referenciaBase];
    const claveBase = `${credenciales.host.toLowerCase()}:${credenciales.puerto}/${credenciales.base.toLowerCase()}`;
    if (bases.has(claveBase)) {
      throw new Error("Cada tenant local debe utilizar una base MySQL distinta");
    }
    bases.add(claveBase);

    const dominiosTenant = new Set<string>();
    for (const dominioRecibido of tenant.dominios) {
      const dominio = normalizarHostname(dominioRecibido);
      if (!dominio || dominio !== dominioRecibido) {
        throw new Error("El registro local contiene un dominio inválido");
      }
      if (dominios.has(dominio)) throw new Error("El registro local asigna un dominio a más de un tenant");
      dominios.add(dominio);
      dominiosTenant.add(dominio);
    }

    if (tenant.dominio) {
      const dominioPrincipal = normalizarHostname(tenant.dominio);
      if (!dominioPrincipal || dominioPrincipal !== tenant.dominio || !dominiosTenant.has(dominioPrincipal)) {
        throw new Error("El dominio principal debe estar incluido en los dominios del tenant");
      }
    }
  }

  for (const referencia of Object.keys(resultado.data.conexiones)) {
    if (!referencias.has(referencia)) {
      throw new Error("El registro local contiene una conexión sin tenant asociado");
    }
  }

  return resultado.data;
}

function indexarRegistro(registro: RegistroValidado): RegistroIndexado {
  const porDominio = new Map<string, TenantRegistryEntry>();
  const porId = new Map<string, TenantRegistryEntry>();
  const porReferencia = new Map<string, TenantRegistryEntry>();
  const conexiones = new Map<string, CredencialesBaseTenant>();

  for (const fila of registro.tenants) {
    const entry: TenantRegistryEntry = {
      tenant: {
        id: fila.id,
        nombre: fila.nombre,
        slug: fila.slug,
        dominio: fila.dominio ? normalizarHostname(fila.dominio) : null,
        estado: fila.estado as EstadoTenant,
      },
      dominios: fila.dominios.map((dominio) => normalizarHostname(dominio) as string),
      referenciaBase: fila.referenciaBase,
      versionCredenciales: fila.versionCredenciales,
    };

    porId.set(fila.id, entry);
    porReferencia.set(fila.referenciaBase, entry);
    for (const dominio of entry.dominios) porDominio.set(dominio, entry);

    const credenciales = registro.conexiones[fila.referenciaBase];
    conexiones.set(
      fila.referenciaBase,
      {
        host: credenciales.host,
        puerto: credenciales.puerto,
        usuario: credenciales.usuario,
        contrasena: credenciales.contrasena,
        base: credenciales.base,
        ssl: credenciales.ssl,
      },
    );
  }

  return { porDominio, porId, porReferencia, conexiones };
}

/** Registro local cifrado, pensado para desarrollo y pruebas con varios tenants. */
export class ProveedorRegistroLocal implements TenantRegistryProvider {
  private cache?: { indexado: RegistroIndexado; venceEn: number };
  private cargaEnCurso?: { generacion: number; promesa: Promise<RegistroIndexado> };
  private generacionCache = 0;
  private readonly rutaArchivo: string;
  private readonly claveHexadecimal: string;
  private readonly ttlMs: number;
  private readonly ahora: () => number;

  constructor(opciones: OpcionesProveedorLocal = {}) {
    this.rutaArchivo = opciones.rutaArchivo ?? rutaRegistroPredeterminada();
    this.claveHexadecimal = opciones.claveHexadecimal ?? claveRegistroPredeterminada();
    this.ttlMs = opciones.ttlMs ?? 5_000;
    this.ahora = opciones.ahora ?? Date.now;
  }

  async resolverPorHostname(hostname: string): Promise<TenantRegistryEntry | null> {
    const host = normalizarHostname(hostname);
    if (!host) return null;
    return (await this.obtenerRegistro()).porDominio.get(host) ?? null;
  }

  async resolverPorId(tenantId: string): Promise<TenantRegistryEntry | null> {
    if (!tenantId.trim()) return null;
    return (await this.obtenerRegistro()).porId.get(tenantId) ?? null;
  }

  async resolverCredenciales(
    referenciaBase: string,
    versionCredenciales: string,
    tenantId?: string,
  ): Promise<CredencialesBaseTenant> {
    const registro = await this.obtenerRegistro();
    const entry = registro.porReferencia.get(referenciaBase);
    if (!entry || entry.versionCredenciales !== versionCredenciales || (tenantId && entry.tenant.id !== tenantId)) {
      throw new Error("La referencia o versión de conexión del tenant no está disponible");
    }

    const credenciales = registro.conexiones.get(referenciaBase);
    if (!credenciales) throw new Error("No se encontraron credenciales para la base del tenant");
    return { ...credenciales };
  }

  async listarTenants(): Promise<TenantRegistryEntry[]> {
    return [...(await this.obtenerRegistro()).porId.values()];
  }

  invalidarCache(): void {
    this.generacionCache += 1;
    this.cache = undefined;
    this.cargaEnCurso = undefined;
  }

  private async obtenerRegistro(): Promise<RegistroIndexado> {
    const ahora = this.ahora();
    if (this.cache && ahora < this.cache.venceEn) return this.cache.indexado;
    if (this.cargaEnCurso?.generacion === this.generacionCache) {
      return this.cargaEnCurso.promesa;
    }

    const generacion = this.generacionCache;
    const promesa = this.cargarRegistro();
    this.cargaEnCurso = { generacion, promesa };
    try {
      const indexado = await promesa;
      if (generacion !== this.generacionCache) return this.obtenerRegistro();
      this.cache = {
        indexado,
        venceEn: this.ahora() + this.ttlMs,
      };
      return indexado;
    } finally {
      if (this.cargaEnCurso?.promesa === promesa) this.cargaEnCurso = undefined;
    }
  }

  private async cargarRegistro(): Promise<RegistroIndexado> {
    if (!this.claveHexadecimal) {
      throw new Error("Falta TENANT_REGISTRY_ENCRYPTION_KEY para usar el registro local");
    }

    let archivo: string;
    try {
      archivo = await readFile(this.rutaArchivo, "utf8");
    } catch {
      throw new Error("No se pudo leer TENANT_REGISTRY_FILE; el registro no está disponible");
    }

    let textoDescifrado: string;
    try {
      textoDescifrado = descifrarRegistroLocal(archivo, this.claveHexadecimal);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "No se pudo descifrar el registro local",
      );
    }

    let contenido: unknown;
    try {
      contenido = JSON.parse(textoDescifrado);
    } catch {
      throw new Error("El contenido del registro local descifrado no es JSON válido");
    }

    return indexarRegistro(validarRegistro(contenido));
  }
}
