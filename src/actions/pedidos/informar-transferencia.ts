"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { conPrismaTenant } from "@/lib/prisma";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import { crearAccionInformarTransferencia } from "@/lib/actions/pedidos/crear-accion-informar-transferencia";

const ejecutarInformarTransferencia = crearAccionInformarTransferencia({
  async obtenerContexto() {
    const contexto = await requiereUsuarioTenant();
    return { tenantId: contexto.tenantId, usuarioId: contexto.usuarioId };
  },
  conPrismaTenant,
});

export async function informarTransferencia(pedidoId: unknown) {
  try {
    const resultado = await ejecutarInformarTransferencia(pedidoId);
    if (resultado.ok) revalidatePath("/mis-pedidos");
    return resultado;
  } catch (error) {
    registrarErrorPagoSeguro("Error informando transferencia", error, "transferencia");
    return { ok: false as const, error: "No se pudo informar la transferencia" };
  }
}
