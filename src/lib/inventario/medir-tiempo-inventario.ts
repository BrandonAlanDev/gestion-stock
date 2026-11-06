import "server-only";

/** Registra duraciones sin IDs, datos de clientes, productos ni parámetros SQL. */
export async function medirTiempoInventario<T>(
  operacion: string,
  cantidadItems: number,
  ejecutar: () => Promise<T>,
): Promise<T> {
  if (process.env.INVENTARIO_MEDIR_TRANSACCIONES !== "1") return ejecutar();

  const inicio = performance.now();
  let resultado: "ok" | "error" = "ok";
  try {
    return await ejecutar();
  } catch (error) {
    resultado = "error";
    throw error;
  } finally {
    console.info("[medicion-inventario]", {
      operacion,
      duracionMs: Math.round(performance.now() - inicio),
      cantidadItems,
      resultado,
    });
  }
}
