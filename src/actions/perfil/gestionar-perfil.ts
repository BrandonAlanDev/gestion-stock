"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { conPrisma } from "@/lib/prisma";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";

const id = z.string().trim().min(1).max(191);
const opcional = (maximo: number) => z.string().trim().max(maximo).optional().transform((valor) => valor || null);
const esquemaDireccion = z.object({
  id: id.optional(), alias: opcional(40), destinatario: opcional(120), telefono: opcional(40),
  calle: z.string().trim().min(1).max(120), numero: z.string().trim().min(1).max(20),
  piso: opcional(20), departamento: opcional(20), codigoPostal: z.string().trim().min(4).max(20),
  localidad: z.string().trim().min(1).max(120), provincia: z.string().trim().min(1).max(120),
  referencias: opcional(1000), esPrincipal: z.boolean(),
});

export async function obtenerDatosCheckout() {
  try {
    const { usuarioId } = await requiereUsuarioTenant();
    return await conPrisma(async (prisma) => {
      const usuario = await prisma.user.findUnique({ where: { id: usuarioId }, select: { name: true, email: true, telefono: true, direcciones: { orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }] } } });
      if (!usuario) return null;
      return { nombre: usuario.name, email: usuario.email, telefono: usuario.telefono, direcciones: usuario.direcciones };
    });
  } catch { return null; }
}

export async function guardarDatosPersonales(datos: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = z.object({ nombre: z.string().trim().min(2).max(120), telefono: z.string().trim().max(40) }).safeParse(datos);
  if (!parsed.success) return { ok: false, error: "Datos personales inválidos" };
  try {
    const { usuarioId } = await requiereUsuarioTenant();
    const resultado = await conPrisma((prisma) => prisma.user.updateMany({ where: { id: usuarioId }, data: { name: parsed.data.nombre, telefono: parsed.data.telefono || null } }));
    if (resultado.count !== 1) return { ok: false, error: "Usuario no encontrado" };
    revalidatePath("/perfil");
    return { ok: true };
  } catch { return { ok: false, error: "No se pudieron guardar tus datos" }; }
}

export async function guardarDireccion(datos: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = esquemaDireccion.safeParse(datos);
  if (!parsed.success) return { ok: false, error: "Completá los datos de la dirección" };
  try {
    const { usuarioId } = await requiereUsuarioTenant();
    const { id: direccionId, esPrincipal, ...campos } = parsed.data;
    const guardada = await conPrisma((prisma) => prisma.$transaction(async (tx) => {
      if (direccionId) {
        const existente = await tx.direccionUsuario.findFirst({ where: { id: direccionId, userId: usuarioId }, select: { id: true } });
        if (!existente) return false;
      }
      if (esPrincipal) await tx.direccionUsuario.updateMany({ where: { userId: usuarioId, esPrincipal: true }, data: { esPrincipal: false } });
      if (direccionId) {
        const resultado = await tx.direccionUsuario.updateMany({ where: { id: direccionId, userId: usuarioId }, data: { ...campos, esPrincipal } });
        return resultado.count === 1;
      }
      await tx.direccionUsuario.create({ data: { ...campos, esPrincipal, userId: usuarioId } });
      return true;
    }));
    if (!guardada) return { ok: false, error: "Dirección no encontrada" };
    revalidatePath("/perfil");
    return { ok: true };
  } catch (error) {
    console.error("Error guardando dirección:", error);
    return { ok: false, error: "No se pudo guardar la dirección" };
  }
}

export async function eliminarDireccion(direccionId: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = id.safeParse(direccionId);
  if (!parsed.success) return { ok: false, error: "Dirección inválida" };
  try {
    const { usuarioId } = await requiereUsuarioTenant();
    const resultado = await conPrisma((prisma) => prisma.direccionUsuario.deleteMany({ where: { id: parsed.data, userId: usuarioId } }));
    if (resultado.count !== 1) return { ok: false, error: "Dirección no encontrada" };
    revalidatePath("/perfil");
    return { ok: true };
  } catch { return { ok: false, error: "No se pudo eliminar la dirección" }; }
}
