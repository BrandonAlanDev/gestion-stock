import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: { maintenanceMode: true },
    });
    return NextResponse.json({ activo: pageConfig?.maintenanceMode === true });
  } catch (error) {
    console.error("Error al consultar el modo mantenimiento:", error);
    return NextResponse.json({ activo: false }, { status: 500 });
  }
}
