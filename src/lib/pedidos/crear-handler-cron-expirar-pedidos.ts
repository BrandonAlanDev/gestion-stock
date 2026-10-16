import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import type { TenantPublico } from "@/types/tenants";

interface TenantProgramable {
  tenant: Pick<TenantPublico, "id" | "estado">;
}

interface DependenciasHandlerCron {
  obtenerSecreto(): string | undefined;
  listarTenants(): Promise<TenantProgramable[]>;
  expirarPedidos(tenantId: string): Promise<number>;
}

function tokenAutorizado(request: NextRequest, secreto: string): boolean {
  const encabezado = request.headers.get("authorization") ?? "";
  const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : "";
  const recibido = Buffer.from(token);
  const esperado = Buffer.from(secreto);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

/** Compone el endpoint para verificar su autorización y selección de tenants. */
export function crearHandlerCronExpirarPedidos(dependencias: DependenciasHandlerCron) {
  return async function GET(request: NextRequest): Promise<NextResponse> {
    const secreto = dependencias.obtenerSecreto();
    if (!secreto) {
      return NextResponse.json({ error: "El job de expiración no está configurado" }, { status: 503 });
    }
    if (!tokenAutorizado(request, secreto)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
      const tenants = await dependencias.listarTenants();
      const activos = tenants.filter(({ tenant }) => tenant.estado === "ACTIVO");
      let totalExpirados = 0;
      let errores = 0;

      for (const { tenant } of activos) {
        try {
          totalExpirados += await dependencias.expirarPedidos(tenant.id);
        } catch {
          errores += 1;
          console.error("Falló la expiración de pedidos para un tenant", tenant.id);
        }
      }

      return NextResponse.json(
        { tenantsProcesados: activos.length, pedidosExpirados: totalExpirados, errores },
        { status: errores > 0 ? 207 : 200 },
      );
    } catch {
      return NextResponse.json({ error: "No se pudo resolver el registro de tenants" }, { status: 503 });
    }
  };
}
