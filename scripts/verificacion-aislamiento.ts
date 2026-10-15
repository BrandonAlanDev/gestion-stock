import "dotenv/config";
import { clientePrisma } from "./verificacion-aislamiento/cliente-prisma";
import { crearContexto } from "./verificacion-aislamiento/crear-contexto";
import { ejecutarCasos } from "./verificacion-aislamiento/ejecutar-casos";
import { limpiarContexto } from "./verificacion-aislamiento/limpiar-contexto";
import type { ContextoVerificacion } from "./verificacion-aislamiento/tipos";

async function main(): Promise<void> {
  let contexto: ContextoVerificacion | null = null;
  try {
    contexto = await crearContexto(clientePrisma);
    const resultados = await ejecutarCasos(contexto);
    resultados.forEach((resultado) => {
      const detalle = resultado.detalle ? `: ${resultado.detalle}` : "";
      console.log(`${resultado.correcto ? "✓" : "✗"} ${resultado.nombre}${detalle}`);
    });
    const fallidos = resultados.filter((resultado) => !resultado.correcto);
    if (fallidos.length > 0) throw new Error(`Fallaron ${fallidos.length} casos de aislamiento`);
    console.log(`Aislamiento verificado: ${resultados.length}/${resultados.length} casos correctos`);
  } finally {
    if (contexto) await limpiarContexto(contexto);
  }
}

main()
  .catch((error: unknown) => {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`FATAL: ${mensaje}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await clientePrisma.$disconnect();
  });
