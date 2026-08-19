import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const pageConfig = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      select: { escuelaEnabled: true, arreglosEnabled: true, personalizadoEnabled: true, planAhorroEnabled: true },
    });
    return NextResponse.json({
      escuelaEnabled: pageConfig?.escuelaEnabled === true,
      arreglosEnabled: pageConfig?.arreglosEnabled === true,
      personalizadoEnabled: pageConfig?.personalizadoEnabled === true,
      planAhorroEnabled: pageConfig?.planAhorroEnabled === true,
    });
  } catch (error) {
    console.error("Error al consultar los módulos de páginas:", error);
    return NextResponse.json(
      { escuelaEnabled: false, arreglosEnabled: false, personalizadoEnabled: false, planAhorroEnabled: false },
      { status: 500 }
    );
  }
}
