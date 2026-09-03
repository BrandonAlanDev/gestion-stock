import "dotenv/config";
import { crearClienteBaseDatos } from "./crear-cliente-base-datos";
import { ejecutarCopia } from "./ejecutar-copia";
import { leerConfiguracionMigracion } from "./leer-configuracion-migracion";
import { obtenerIdentidadBaseDatos } from "./obtener-identidad-base-datos";
import { validarPreflight } from "./validar-preflight";
import { guardarInformeHuerfanos } from "./guardar-informe-huerfanos";

export async function main(): Promise<void> {
  const configuracion = leerConfiguracionMigracion();
  const identidadOrigen = obtenerIdentidadBaseDatos(configuracion.urlOrigen);
  const identidadDestino = obtenerIdentidadBaseDatos(configuracion.urlDestino);
  if (
    identidadOrigen.servidor === identidadDestino.servidor &&
    identidadOrigen.baseDatos === identidadDestino.baseDatos
  ) {
    throw new Error("La base de origen y la de destino son la misma.");
  }

  const origen = crearClienteBaseDatos(configuracion.urlOrigen);
  const destino = crearClienteBaseDatos(configuracion.urlDestino);
  try {
    await origen.$transaction(async (lectura) => {
      console.log("[1/3] Validando schemas, relaciones y destino...");
      const cantidades = await validarPreflight(
        lectura,
        destino,
        configuracion,
        identidadOrigen.baseDatos,
        identidadDestino.baseDatos,
      );
      const total = [...cantidades.values()].reduce((suma, cantidad) => suma + cantidad, 0);
      const omitidas = configuracion.omitirRelacionesHuerfanas
        ? await guardarInformeHuerfanos(lectura) : 0;
      console.log(`Preflight correcto: ${total - omitidas} filas para copiar; ${omitidas} relaciones excluidas.`);
      if (!configuracion.confirmar) {
        console.log("[SIMULACIÓN] No se escribió en ninguna base. Repetí con --confirmar para copiar.");
        return;
      }
      console.log("[2/3] Copiando dentro de una transacción de destino...");
      const resumen = await ejecutarCopia(
        lectura,
        destino,
        identidadDestino.baseDatos,
        configuracion,
      );
      console.log(`[3/3] Migración validada. Tenant creado: ${resumen.tenantId}`);
    }, { isolationLevel: "RepeatableRead", maxWait: 30_000, timeout: 1_800_000 });
  } finally {
    await Promise.allSettled([origen.$disconnect(), destino.$disconnect()]);
  }
}

main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : "Error desconocido";
  const mensajeSeguro = mensaje.replace(/mysql:\/\/[^\s]+/gi, "[URL OCULTA]");
  console.error(`FATAL: ${mensajeSeguro}`);
  process.exitCode = 1;
});
