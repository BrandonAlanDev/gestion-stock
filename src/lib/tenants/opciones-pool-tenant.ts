export interface OpcionesPoolTenant {
  connectionLimit: number;
  /** MariaDB espera segundos y usa este valor para cerrar conexiones ociosas. */
  idleTimeout: number;
  minimumIdle: 1;
}

export function crearOpcionesPoolTenant(
  ttlInactividadMs: number,
  limiteConexiones: number,
): OpcionesPoolTenant {
  if (!Number.isInteger(ttlInactividadMs) || ttlInactividadMs < 1) {
    throw new Error("El TTL del pool tenant debe ser un entero positivo");
  }
  if (!Number.isInteger(limiteConexiones) || limiteConexiones < 1) {
    throw new Error("El límite del pool tenant debe ser un entero positivo");
  }

  return {
    connectionLimit: limiteConexiones,
    idleTimeout: Math.max(1, Math.ceil(ttlInactividadMs / 1000)),
    minimumIdle: 1,
  };
}
