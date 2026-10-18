import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { PrismaClient } from "../generated/prisma/client";
import { reclamarAdministradorGoogle } from "../src/lib/autenticacion/reclamar-admin-google";
import { registrarUsuarioTenant } from "../src/lib/autenticacion/registrar-usuario-tenant";

type Usuario = { id: string; email: string; role: "ADMIN" | "USER"; password: string | null };
type Reserva = { email: string; codigoHash: string | null };
type Cuenta = { userId: string; provider: string; providerAccountId: string };

function baseFalsa(usuarios: Usuario[], reservas: Reserva[], cuentas: Cuenta[] = []) {
  const operaciones: string[] = [];
  const transaccion = {
    admin_pending_email: {
      async findUnique({ where }: { where: { email: string } }) {
        return reservas.find((fila) => fila.email === where.email) ?? null;
      },
      async deleteMany({ where }: { where: { email: string; codigoHash: string | null } }) {
        const indice = reservas.findIndex((fila) => fila.email === where.email && fila.codigoHash === where.codigoHash);
        if (indice < 0) return { count: 0 };
        reservas.splice(indice, 1);
        operaciones.push("reserva-consumida");
        return { count: 1 };
      },
    },
    user: {
      async findUnique({ where }: { where: { email: string } }) {
        return usuarios.find((fila) => fila.email === where.email) ?? null;
      },
      async create({ data }: { data: Usuario & { name?: string | null } }) {
        const usuario = { ...data, id: `nuevo-${usuarios.length}`, password: data.password ?? null };
        usuarios.push(usuario);
        operaciones.push(`usuario-${usuario.role}`);
        return usuario;
      },
      async update({ where, data }: { where: { id: string }; data: { password: string } }) {
        const usuario = usuarios.find((fila) => fila.id === where.id);
        assert.ok(usuario);
        usuario.password = data.password;
        operaciones.push("usuario-heredado");
        return usuario;
      },
    },
    account: {
      async create({ data }: { data: Cuenta }) {
        cuentas.push(data);
        operaciones.push("cuenta-google");
        return data;
      },
    },
  };
  const cliente = {
    ...transaccion,
    async $transaction<T>(operacion: (cliente: typeof transaccion) => Promise<T>): Promise<T> {
      return operacion(transaccion);
    },
  };
  return { prisma: cliente as unknown as PrismaClient, operaciones };
}

async function verificarRegistroManual(): Promise<void> {
  const codigo = "a".repeat(64);
  const email = "admin@ejemplo.com";
  const usuarios: Usuario[] = [];
  const reservas: Reserva[] = [{ email, codigoHash: createHash("sha256").update(codigo).digest("hex") }];
  const { prisma, operaciones } = baseFalsa(usuarios, reservas);
  const datos = { email, name: "Admin", passwordHash: "hash", passwordLength: 12 };

  assert.equal(await registrarUsuarioTenant(prisma, { ...datos, codigoInvitacion: "b".repeat(64) }), "codigo-invalido");
  assert.equal(await registrarUsuarioTenant(prisma, { ...datos, codigoInvitacion: codigo, passwordLength: 11 }), "password-corta");
  assert.equal(usuarios.length, 0);
  assert.equal(reservas.length, 1);
  assert.equal(await registrarUsuarioTenant(prisma, { ...datos, codigoInvitacion: codigo }), "creado");
  assert.equal(usuarios[0]?.role, "ADMIN");
  assert.equal(reservas.length, 0);
  assert.deepEqual(operaciones, ["reserva-consumida", "usuario-ADMIN"]);

  const comunes: Usuario[] = [];
  const baseComun = baseFalsa(comunes, []);
  assert.equal(await registrarUsuarioTenant(baseComun.prisma, { ...datos, email: "cliente@ejemplo.com" }), "creado");
  assert.equal(comunes[0]?.role, "USER");
  assert.equal(await registrarUsuarioTenant(baseComun.prisma, { ...datos, email: "otro@ejemplo.com", codigoInvitacion: codigo }), "codigo-invalido");

  const heredado: Usuario[] = [{ id: "id-original", email, role: "ADMIN", password: null }];
  const reservaHeredada: Reserva[] = [{ email, codigoHash: createHash("sha256").update(codigo).digest("hex") }];
  assert.equal(await registrarUsuarioTenant(baseFalsa(heredado, reservaHeredada).prisma, { ...datos, codigoInvitacion: codigo }), "creado");
  assert.equal(heredado.length, 1);
  assert.equal(heredado[0]?.id, "id-original");
  assert.equal(heredado[0]?.password, "hash");
  assert.equal(reservaHeredada.length, 0);
}

async function verificarRegistroGoogle(): Promise<void> {
  const email = "admin@gmail.com";
  const usuarios: Usuario[] = [];
  const reservas: Reserva[] = [{ email, codigoHash: null }];
  const cuentas: Cuenta[] = [];
  const { prisma, operaciones } = baseFalsa(usuarios, reservas, cuentas);
  const solicitud = {
    email, providerAccountId: "sub-1", name: "Admin", image: null,
    profile: { email, sub: "sub-1", email_verified: true },
  };
  assert.equal(await registrarUsuarioTenant(prisma, { email, name: "Admin", passwordHash: "hash", passwordLength: 12 }), "usar-google");
  assert.equal(await reclamarAdministradorGoogle(prisma, { ...solicitud, profile: { ...solicitud.profile, email_verified: false } }), false);
  assert.equal(await reclamarAdministradorGoogle(prisma, { ...solicitud, profile: { ...solicitud.profile, sub: "otro" } }), false);
  assert.equal(usuarios.length, 0);
  assert.equal(reservas.length, 1);
  assert.equal(await reclamarAdministradorGoogle(prisma, solicitud), true);
  assert.equal(usuarios[0]?.role, "ADMIN");
  assert.equal(cuentas[0]?.userId, usuarios[0]?.id);
  assert.equal(reservas.length, 0);
  assert.deepEqual(operaciones, ["reserva-consumida", "usuario-ADMIN", "cuenta-google"]);

  const comunes: Usuario[] = [];
  assert.equal(await reclamarAdministradorGoogle(baseFalsa(comunes, []).prisma, {
    email: "nuevo@example.com", providerAccountId: "sub-2", name: null, image: null, profile: null,
  }), true);
  assert.equal(comunes.length, 0, "Auth.js crea al comprador después del callback");

  const corporativo: Reserva[] = [{ email: "admin@empresa.com", codigoHash: null }];
  const baseCorporativa = baseFalsa([], corporativo);
  assert.equal(await reclamarAdministradorGoogle(baseCorporativa.prisma, {
    email: "admin@empresa.com", providerAccountId: "sub-3", name: null, image: null,
    profile: { email: "admin@empresa.com", sub: "sub-3", email_verified: true },
  }), false);
  assert.equal(corporativo.length, 1);
}

async function main(): Promise<void> {
  await verificarRegistroManual();
  await verificarRegistroGoogle();
  console.log("Registro común e invitaciones de administrador verificadas.");
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
