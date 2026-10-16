import "dotenv/config";
import { conPrismaTenant, invalidarClientesPrismaTenant } from "../src/lib/tenants/prisma-factory";
import { obtenerProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import { crearContexto } from "./verificacion-aislamiento/crear-contexto";
import { ejecutarCasos } from "./verificacion-aislamiento/ejecutar-casos";
import { limpiarContexto } from "./verificacion-aislamiento/limpiar-contexto";
import {
  confirmarDestinoAislamiento,
  validarDestinoLocalDescartable,
} from "./tenants/validar-destino-aislamiento";

async function main(): Promise<void> {
  if (process.env.TENANT_ISOLATION_TEST_MODE !== "1" || process.env.NODE_ENV === "production") {
    throw new Error("La verificación escribe datos temporales: habilitala solo en un entorno de prueba descartable");
  }

  const tenantId = process.env.TENANT_ISOLATION_TEST_TENANT_ID?.trim();
  if (!tenantId) throw new Error("Definí TENANT_ISOLATION_TEST_TENANT_ID para elegir la base descartable");

  const registro = obtenerProveedorRegistroTenant();
  const entry = await registro.resolverPorId(tenantId);
  if (!entry || entry.tenant.estado !== "ACTIVO") {
    throw new Error("El tenant de prueba no existe o no está activo en el registro local");
  }
  const credenciales = await registro.resolverCredenciales(
    entry.referenciaBase,
    entry.versionCredenciales,
    entry.tenant.id,
  );
  validarDestinoLocalDescartable(tenantId, credenciales);
  confirmarDestinoAislamiento(
    tenantId,
    credenciales,
    process.env.TENANT_ISOLATION_TEST_CONFIRM_TARGET,
  );

  try {
    await conPrismaTenant(tenantId, async (clientePrisma) => {
      let contexto = null;
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
    });
  } finally {
    await invalidarClientesPrismaTenant(tenantId);
  }
}

main()
  .catch((error: unknown) => {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`FATAL: ${mensaje}`);
    process.exitCode = 1;
  })
