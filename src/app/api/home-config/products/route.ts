import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.garment.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: products });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Error al obtener productos" }, { status: 500 });
  }
}