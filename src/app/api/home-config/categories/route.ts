import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requiereAdmin();
    const categories = await conPrisma((prisma) =>
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
