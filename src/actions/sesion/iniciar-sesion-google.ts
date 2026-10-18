"use server";

import { signIn } from "@/auth";
import { obtenerTenantAutenticacion } from "@/lib/autenticacion/obtener-tenant-autenticacion";

export async function iniciarSesionGoogle(): Promise<void> {
  await obtenerTenantAutenticacion();
  await signIn("google", { redirectTo: "/" });
}
