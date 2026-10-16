import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function GET() {
  try {
    const { tenantId } = await requiereAdmin();
    const products = await conPrismaTenant(tenantId, (prisma) =>
      prisma.garment.findMany({
        where: { tenantId, active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    );
    return NextResponse.json({ success: true, data: products });
  } catch {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }
}
