import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function GET() {
  try {
    const { tenantId } = await requiereAdmin();
    const categories = await conPrismaTenant(tenantId, (prisma) =>
      prisma.category.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    );
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }
}
