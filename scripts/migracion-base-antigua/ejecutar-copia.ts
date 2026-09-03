import type { PrismaClient } from "../../generated/prisma/client";
import { copiarPuentes } from "./copiar-puentes";
import { copiarTabla } from "./copiar-tabla";
import { TABLAS_MIGRACION } from "./definiciones-migracion";
import type { ConfiguracionMigracion } from "./tipos-configuracion";
import type { ClienteLectura, MapaIds, ResumenMigracion } from "./tipos-migracion";
import { validarResultado } from "./validar-resultado";
import { reasignarReferenciasContenido } from "./reasignar-referencias-contenido";

export async function ejecutarCopia(
  origen: ClienteLectura,
  destino: PrismaClient,
  baseDestino: string,
  configuracion: ConfiguracionMigracion,
): Promise<ResumenMigracion> {
  return destino.$transaction(async (transaccion) => {
    const tenant = await transaccion.tenant.create({
      data: {
        nombre: configuracion.tenant.nombre,
        slug: configuracion.tenant.slug,
        dominio: configuracion.tenant.dominio,
        estado: "ACTIVO",
      },
      select: { id: true },
    });
    const mapas: MapaIds = new Map();
    const cantidades = new Map<string, number>();
    for (const tabla of TABLAS_MIGRACION) {
      const cantidad = await copiarTabla(
        origen,
        transaccion,
        baseDestino,
        tabla,
        tenant.id,
        mapas,
      );
      cantidades.set(tabla.destino, cantidad);
      console.log(`  ${tabla.destino}: ${cantidad}`);
    }
    const cantidadesPuentes = await copiarPuentes(origen, transaccion, tenant.id, mapas, configuracion.omitirRelacionesHuerfanas);
    for (const [tabla, cantidad] of cantidadesPuentes) {
      cantidades.set(tabla, cantidad);
      console.log(`  ${tabla}: ${cantidad}`);
    }
    await reasignarReferenciasContenido(transaccion, tenant.id, mapas);
    await validarResultado(transaccion, tenant.id, cantidades);
    return { tenantId: tenant.id, cantidades };
  }, { maxWait: 30_000, timeout: 900_000 });
}
