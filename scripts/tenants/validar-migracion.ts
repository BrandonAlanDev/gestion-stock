import { createHash } from "node:crypto";

export interface ConfiguracionEjecucionMigracion {
  ids: readonly string[];
  todos: boolean;
  planificacion: boolean;
  modo: string | undefined;
  confirmacion: string | undefined;
  registroCongeladoAck: string | undefined;
  baselineReconciliada: string | undefined;
  nodeEnv: string | undefined;
  permitirProduccion: string | undefined;
}

export interface DestinoMigracionConfirmable {
  tenantId: string;
  host: string;
  puerto: number;
  base: string;
  ssl: boolean;
}

/** Serializa los destinos sin incluir usuario, contraseña ni parámetros de conexión. */
export function construirConfirmacionDestinos(
  destinos: readonly DestinoMigracionConfirmable[],
): string {
  return destinos.map(({ tenantId, host, puerto, base, ssl }) =>
    `${encodeURIComponent(tenantId)}@${encodeURIComponent(host.toLowerCase())}:${puerto}/${encodeURIComponent(base)};tls=${ssl ? "1" : "0"}`,
  ).join("|");
}

/** Huella compacta para confirmar listas grandes de destinos sin secretos. */
export function construirHuellaConfirmacionDestinos(
  destinos: readonly DestinoMigracionConfirmable[],
): string {
  const contenido = construirConfirmacionDestinos(destinos);
  return `sha256:${createHash("sha256").update(contenido, "utf8").digest("hex")}`;
}

/** Ordena la lista completa y rechaza IDs vacíos o duplicados. */
export function ordenarIdsTenant(ids: readonly string[]): string[] {
  const normalizados = ids.map((id) => id.trim());
  if (normalizados.some((id) => !id)) {
    throw new Error("El registro de tenants contiene un ID vacío");
  }
  if (new Set(normalizados).size !== normalizados.length) {
    throw new Error("El registro de tenants contiene IDs repetidos");
  }
  return normalizados.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
}

/** Impide iniciar un lote si el conjunto del registro cambió desde la planificación. */
export function validarMismoConjuntoTenantIds(
  esperados: readonly string[],
  actuales: readonly string[],
): void {
  const listaEsperada = ordenarIdsTenant(esperados);
  const listaActual = ordenarIdsTenant(actuales);
  if (JSON.stringify(listaEsperada) !== JSON.stringify(listaActual)) {
    throw new Error("El conjunto de tenants cambió durante el preflight; planificá y confirmá el lote nuevamente");
  }
}

export function validarConfirmacionDestinos(
  confirmacion: string | undefined,
  destinos: readonly DestinoMigracionConfirmable[],
  permitirHuella = false,
): void {
  const esperada = construirConfirmacionDestinos(destinos);
  const coincideTexto = confirmacion === esperada;
  const coincideHuella = permitirHuella
    && confirmacion === construirHuellaConfirmacionDestinos(destinos);
  if (!coincideTexto && !coincideHuella) {
    throw new Error("TENANT_MIGRATION_CONFIRM_TARGETS debe coincidir exactamente con los destinos mostrados");
  }
}

/** Comprueba todas las guardas antes de resolver credenciales o tocar una base. */
export function validarEjecucionMigracion(configuracion: ConfiguracionEjecucionMigracion): void {
  if (configuracion.modo !== "1") {
    throw new Error("Definí TENANT_MIGRATION_MODE=1 para habilitar el runner administrativo");
  }
  if (configuracion.todos && configuracion.ids.length > 0) {
    throw new Error("Usá --todos o TENANT_MIGRATION_IDS, pero no ambos");
  }
  if (!configuracion.todos && configuracion.ids.length === 0) {
    throw new Error("Definí los tenants explícitos en TENANT_MIGRATION_IDS");
  }
  if (configuracion.ids.some((id) => !id.trim())) {
    throw new Error("La lista de tenants contiene un ID vacío");
  }
  if (new Set(configuracion.ids).size !== configuracion.ids.length) {
    throw new Error("La lista de tenants contiene IDs repetidos");
  }
  const confirmacionEsperada = configuracion.todos
    ? "TODOS"
    : configuracion.ids.join(",");
  if (configuracion.confirmacion !== confirmacionEsperada) {
    throw new Error(configuracion.todos
      ? "TENANT_MIGRATION_CONFIRM debe ser TODOS cuando se usa --todos"
      : "TENANT_MIGRATION_CONFIRM debe repetir, en el mismo orden, los IDs seleccionados");
  }
  if (
    configuracion.todos &&
    !configuracion.planificacion &&
    configuracion.registroCongeladoAck !== "1"
  ) {
    throw new Error("Pausá altas y cambios de estado/destino y definí TENANT_MIGRATION_REGISTRY_FROZEN_ACK=1");
  }
  if (configuracion.baselineReconciliada !== "1") {
    throw new Error("No se permite migrar antes de reconciliar la baseline de cada silo");
  }
  if (configuracion.nodeEnv === "production" && configuracion.permitirProduccion !== "1") {
    throw new Error("Las migraciones productivas requieren TENANT_MIGRATION_ALLOW_PRODUCTION=1");
  }
}
