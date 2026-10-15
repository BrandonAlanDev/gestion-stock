import { obtenerCarruselesCacheados } from "@/lib/cache/obtener-carruseles-cacheados";
import { contarCarruselesActivos } from "@/lib/services/carruseles/contar-carruseles-activos";
import { obtenerCarruseles } from "@/lib/services/carruseles/obtener-carruseles";
import { obtenerLimitesCarrusel } from "@/lib/services/carruseles/obtener-limites-carrusel";
import { TIPOS_CARRUSEL_ADMITIDOS } from "@/lib/services/carruseles/constantes";
import { NextRequest, NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoSolicitado = searchParams.get("type");
    const type = TIPOS_CARRUSEL_ADMITIDOS.find((tipo) => tipo === tipoSolicitado);
    if (tipoSolicitado !== null && !type) {
      return NextResponse.json(
        { success: false, error: "Tipo de carrusel no válido" },
        { status: 400 },
      );
    }
    const rawActive = searchParams.get("activeOnly");
    const admin = searchParams.get("admin") === "true";
    const activeOnly = admin ? rawActive === "true" : rawActive !== "false";

    if (admin) {
      const { tenantId } = await requiereAdmin();
      const carousels = await obtenerCarruseles(tenantId, type, activeOnly);
      const counts = await contarCarruselesActivos(tenantId);
      const limits = await obtenerLimitesCarrusel();
      return NextResponse.json({ success: true, data: carousels, counts, limits });
    }

    const { id: tenantId } = await requiereTenantActivo();
    if (type) {
      const carousels = await obtenerCarruseles(tenantId, type, true);
      return NextResponse.json({ success: true, data: carousels });
    }

    const carousels = await obtenerCarruselesCacheados(tenantId);
    return NextResponse.json({ success: true, data: carousels });
  } catch (error) {
    console.error("Error fetching carousels:", error);
    return NextResponse.json({ success: false, error: "Error al obtener carruseles" }, { status: 500 });
  }
}
