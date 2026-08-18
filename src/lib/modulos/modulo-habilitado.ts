import prisma from "@/lib/prisma";

export type ClaveModulo = "escuelaEnabled" | "arreglosEnabled" | "personalizadoEnabled";

export async function moduloHabilitado(clave: ClaveModulo): Promise<boolean> {
  try {
    const config = (await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: { [clave]: true },
    })) as Partial<Record<ClaveModulo, boolean>> | null;
    return config?.[clave] === true;
  } catch (error) {
    console.error("Error al consultar el módulo:", error);
    return false;
  }
}
