import prisma from "@/lib/prisma";

export async function validarRelacionesModelo(
  tenantId: string,
  datos: { tailIds: string[]; finIds: string[]; configIds: string[] }
) {
  const tailIds = [...new Set(datos.tailIds)];
  const finIds = [...new Set(datos.finIds)];
  const configIds = [...new Set(datos.configIds)];
  const [colas, quillas, configuraciones] = await Promise.all([
    prisma.boardTailOption.count({ where: { tenantId, id: { in: tailIds } } }),
    prisma.boardFinOption.count({ where: { tenantId, id: { in: finIds } } }),
    prisma.boardFinConfigOption.count({ where: { tenantId, id: { in: configIds } } }),
  ]);
  if (colas !== tailIds.length || quillas !== finIds.length || configuraciones !== configIds.length) {
    throw new Error("Una opción relacionada no pertenece a esta tienda.");
  }
  return { tailIds, finIds, configIds };
}
