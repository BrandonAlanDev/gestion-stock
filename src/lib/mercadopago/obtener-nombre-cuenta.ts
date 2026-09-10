import "server-only";

import { prisma } from "@/lib/prisma";
import { obtenerCuentaMP } from "./obtener-cuenta";
import { obtenerTokenAccesoMP } from "./obtener-token-acceso";

function obtenerTexto(datos: Record<string, unknown>, clave: string): string | null {
  const valor = datos[clave];
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

function construirNombreCuenta(datos: Record<string, unknown>): string | null {
  const nombreNegocio = obtenerTexto(datos, "business_name");
  if (nombreNegocio) return nombreNegocio;

  const nombre = obtenerTexto(datos, "first_name");
  const apellido = obtenerTexto(datos, "last_name");
  const nombreCompleto = [nombre, apellido].filter(Boolean).join(" ");
  if (nombreCompleto) return nombreCompleto;

  return obtenerTexto(datos, "nickname");
}

/** Obtiene un nombre legible de la cuenta conectada sin exponer sus credenciales. */
export async function obtenerNombreCuentaMP(tenantId: string): Promise<string | null> {
  const cuenta = await obtenerCuentaMP(tenantId);
  if (!cuenta?.conectado) return null;

  try {
    const tokenAcceso = await obtenerTokenAccesoMP(tenantId);

    const respuesta = await fetch("https://api.mercadopago.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenAcceso}`,
      },
      cache: "no-store",
    });

    if (!respuesta.ok) return null;

    const datos: unknown = await respuesta.json();
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) return null;

    const nombre = construirNombreCuenta(datos as Record<string, unknown>);
    if (nombre) {
      await prisma.cuentaMercadoPago.update({
        where: { tenantId },
        data: { nombreNegocio: nombre },
      });
    }

    return nombre;
  } catch {
    return null;
  }
}
