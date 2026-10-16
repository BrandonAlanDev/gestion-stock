export interface MigracionVersionada {
  nombre: string;
  checksum: string;
}

export interface RegistroMigracionAplicada {
  nombre: string;
  checksum: string;
  finalizada: boolean;
  revertida: boolean;
}

export type EstadoTenantMigrable =
  | "ACTIVO"
  | "PROVISIONING"
  | "SUSPENDIDO"
  | "INACTIVO";

/** Compara historial aplicado y repo por nombre y checksum, sin depender del orden de lectura. */
export function coincideHistorialMigraciones(
  aplicadas: readonly MigracionVersionada[],
  versionadas: readonly MigracionVersionada[],
): boolean {
  if (aplicadas.length !== versionadas.length) return false;

  const ordenar = (migraciones: readonly MigracionVersionada[]) =>
    [...migraciones].sort((a, b) => a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0);
  const historialAplicado = ordenar(aplicadas);
  const historialVersionado = ordenar(versionadas);

  return historialAplicado.every((migracion, indice) => {
    const versionada = historialVersionado[indice];
    return migracion.nombre === versionada?.nombre && migracion.checksum === versionada.checksum;
  });
}

/** Valida que migrate deploy continúe un prefijo íntegro o parta de una base vacía. */
export function validarHistorialAntesDeDeploy(
  registros: readonly RegistroMigracionAplicada[],
  versionadas: readonly MigracionVersionada[],
  tieneObjetosPersistentes: boolean,
  estadoTenant: EstadoTenantMigrable,
): void {
  const incompleta = registros.find((registro) => !registro.finalizada && !registro.revertida);
  if (incompleta) {
    throw new Error(`La base tiene una migración incompleta: ${incompleta.nombre}`);
  }

  const aplicadas = registros
    .filter((registro) => registro.finalizada && !registro.revertida)
    .map(({ nombre, checksum }) => ({ nombre, checksum }));

  if (aplicadas.length === 0 && estadoTenant !== "PROVISIONING") {
    throw new Error(
      "Solo un tenant PROVISIONING puede inicializarse sin un historial de migraciones aplicado",
    );
  }
  if (tieneObjetosPersistentes && aplicadas.length === 0) {
    throw new Error(
      "La base contiene objetos pero no tiene un historial de migraciones aplicado; reconciliá la baseline antes de continuar",
    );
  }
  if (aplicadas.length > 0 && !tieneObjetosPersistentes) {
    throw new Error("El historial registra migraciones aplicadas pero la base no contiene objetos persistentes");
  }

  const prefijoVersionado = versionadas.slice(0, aplicadas.length);
  if (!coincideHistorialMigraciones(aplicadas, prefijoVersionado)) {
    throw new Error(
      "El historial aplicado no coincide con un prefijo de las migraciones versionadas; reconciliá la baseline antes de continuar",
    );
  }
}
