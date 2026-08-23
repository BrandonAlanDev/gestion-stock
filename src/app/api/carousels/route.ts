import { getCachedCarousels } from "@/lib/cache";
import * as carouselService from "@/lib/services/carousel-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "HERO" | "BANNER" | "CARDS" | null;
    const rawActive = searchParams.get("activeOnly");
    const admin = searchParams.get("admin") === "true";
    const activeOnly = admin ? rawActive === "true" : rawActive !== "false";

    if (admin) {
      const carousels = await carouselService.getCarousels(type ?? undefined, activeOnly);
      const counts = await carouselService.countActiveCarouselsByType();
      const limits = await carouselService.getCarouselLimits();
      return NextResponse.json({ success: true, data: carousels, counts, limits });
    }

    if (type) {
      const carousels = await carouselService.getCarousels(type, true);
      return NextResponse.json({ success: true, data: carousels });
    }

    const carousels = await getCachedCarousels();
    return NextResponse.json({ success: true, data: carousels });
  } catch (error) {
    console.error("Error fetching carousels:", error);
    return NextResponse.json({ success: false, error: "Error al obtener carruseles" }, { status: 500 });
  }
}