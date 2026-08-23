import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const obtenerMantenimientoActivo = unstable_cache(
  async () => {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: { maintenanceMode: true },
    });
    return pageConfig?.maintenanceMode === true;
  },
  ["mantenimiento-activo"],
  { revalidate: 60, tags: ["page-config"] }
);

export async function GET(): Promise<NextResponse> {
  try {
    const activo = await obtenerMantenimientoActivo();
    return NextResponse.json({ activo });
  } catch (error) {
    console.error("Error al consultar el modo mantenimiento:", error);
    return NextResponse.json({ activo: false }, { status: 500 });
  }
}
