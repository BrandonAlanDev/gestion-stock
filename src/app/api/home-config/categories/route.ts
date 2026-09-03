import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function GET() {
  try {
    const { tenantId } = await requiereAdmin();
    const categories = await prisma.category.findMany({
      where: { tenantId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }
}
