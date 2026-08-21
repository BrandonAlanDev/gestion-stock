import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const obtenerModulosActivos = unstable_cache(
  async () => {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: { escuelaEnabled: true, arreglosEnabled: true, personalizadoEnabled: true, planAhorroEnabled: true },
    });
    return {
      escuelaEnabled: pageConfig?.escuelaEnabled === true,
      arreglosEnabled: pageConfig?.arreglosEnabled === true,
      personalizadoEnabled: pageConfig?.personalizadoEnabled === true,
      planAhorroEnabled: pageConfig?.planAhorroEnabled === true,
    };
  },
  ["modulos-activos"],
  { revalidate: 60, tags: ["page-config"] }
);

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await obtenerModulosActivos());
  } catch (error) {
    console.error("Error al consultar los módulos de páginas:", error);
    return NextResponse.json(
      { escuelaEnabled: false, arreglosEnabled: false, personalizadoEnabled: false, planAhorroEnabled: false },
      { status: 500 }
    );
  }
}
