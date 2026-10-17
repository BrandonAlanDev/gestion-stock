import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

interface DependenciasHandlerCron {
  obtenerSecreto(): string | undefined;
  expirarPedidos(): Promise<number>;
}

function tokenAutorizado(request: NextRequest, secreto: string): boolean {
  const encabezado = request.headers.get("authorization") ?? "";
  const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : "";
  const recibido = Buffer.from(token);
  const esperado = Buffer.from(secreto);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

/** Compone el endpoint autorizado para expirar reservas. */
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
      const pedidosExpirados = await dependencias.expirarPedidos();
      return NextResponse.json({ pedidosExpirados }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "No se pudieron expirar los pedidos" }, { status: 500 });
    }
  };
}
