import prisma from "@/lib/prisma";

export type ClaveModulo = "escuelaEnabled" | "arreglosEnabled" | "personalizadoEnabled" | "planAhorroEnabled";

export async function moduloHabilitado(tenantId: string, clave: ClaveModulo): Promise<boolean> {
  try {
    const config = (await prisma.pageConfig.findFirst({
      where: { tenantId },
      select: { [clave]: true },
    })) as Partial<Record<ClaveModulo, boolean>> | null;
    return config?.[clave] === true;
  } catch (error) {
    console.error("Error al consultar el módulo:", error);
    return false;
  }
}
