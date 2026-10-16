import assert from "node:assert/strict";
import type { AdapterAccount, AdapterUser } from "next-auth/adapters";
import type { PrismaClient } from "../generated/prisma/client";
import { crearAdaptadorTenant } from "../src/lib/autenticacion/crear-adaptador-tenant";
import type { TenantPublico } from "../src/types/tenants";

interface UsuarioFalso extends AdapterUser {
  tenantId: string;
  role: "ADMIN" | "USER";
}

interface CuentaFalsa extends AdapterAccount {
  tenantId: string;
}

interface AlmacenFalso {
  usuarios: UsuarioFalso[];
  cuentas: CuentaFalsa[];
}

function comoRegistro(valor: unknown): Record<string, unknown> {
  assert.equal(typeof valor, "object");
  assert.notEqual(valor, null);
  return valor as Record<string, unknown>;
}

function tenantIdUsuario(usuario: AdapterUser | null | undefined): unknown {
  return usuario && "tenantId" in usuario ? usuario.tenantId : undefined;
}

function crearClienteFalso(tenantId: string, almacen: AlmacenFalso): PrismaClient {
  const cliente = {
    user: {
      async create(argumentos: unknown) {
        const data = comoRegistro(comoRegistro(argumentos).data);
        const usuario: UsuarioFalso = {
          id: `creado-${almacen.usuarios.length + 1}`,
          tenantId: String(data.tenantId),
          name: typeof data.name === "string" ? data.name : null,
          email: String(data.email),
          emailVerified: data.emailVerified instanceof Date ? data.emailVerified : null,
          image: typeof data.image === "string" ? data.image : null,
          role: data.role === "ADMIN" ? "ADMIN" : "USER",
        };
        almacen.usuarios.push(usuario);
        return { ...usuario };
      },
      async findFirst(argumentos: unknown) {
        const where = comoRegistro(comoRegistro(argumentos).where);
        return almacen.usuarios.find((usuario) =>
          usuario.id === where.id && usuario.tenantId === where.tenantId,
        ) ?? null;
      },
      async findUnique(argumentos: unknown) {
        const where = comoRegistro(comoRegistro(argumentos).where);
        const clave = comoRegistro(where.tenantId_email);
        return almacen.usuarios.find((usuario) =>
          usuario.tenantId === clave.tenantId && usuario.email === clave.email,
        ) ?? null;
      },
    },
    account: {
      async findUnique(argumentos: unknown) {
        const where = comoRegistro(comoRegistro(argumentos).where);
        const clave = comoRegistro(where.tenantId_provider_providerAccountId);
        const cuenta = almacen.cuentas.find((fila) =>
          fila.tenantId === clave.tenantId &&
          fila.provider === clave.provider &&
          fila.providerAccountId === clave.providerAccountId,
        );
        if (!cuenta) return null;
        const usuario = almacen.usuarios.find((fila) => fila.id === cuenta.userId);
        return usuario ? { ...cuenta, user: { ...usuario } } : null;
      },
      async create(argumentos: unknown) {
        const data = comoRegistro(comoRegistro(argumentos).data);
        const cuenta: CuentaFalsa = {
          id: `cuenta-${almacen.cuentas.length + 1}`,
          tenantId,
          userId: String(data.userId),
          type: String(data.type) as AdapterAccount["type"],
          provider: String(data.provider),
          providerAccountId: String(data.providerAccountId),
        };
        almacen.cuentas.push(cuenta);
        return { ...cuenta };
      },
    },
  } as unknown as PrismaClient;
  return cliente;
}

const TENANT_A: TenantPublico = {
  id: "tenant-a",
  nombre: "Tienda A",
  slug: "tienda-a",
  dominio: "a.example.com",
  estado: "ACTIVO",
};

async function main(): Promise<void> {
  const almacenA: AlmacenFalso = {
    usuarios: [{
      id: "usuario-compartido",
      tenantId: "tenant-a",
      name: "Admin A",
      email: "admin@example.com",
      emailVerified: null,
      image: null,
      role: "ADMIN",
    }],
    cuentas: [{
      id: "cuenta-a",
      tenantId: "tenant-a",
      userId: "usuario-compartido",
      type: "oauth",
      provider: "google",
      providerAccountId: "google-123",
    }],
  };
  const almacenB: AlmacenFalso = {
    usuarios: [{
      id: "usuario-compartido",
      tenantId: "tenant-b",
      name: "Admin B",
      email: "admin@example.com",
      emailVerified: null,
      image: null,
      role: "ADMIN",
    }, {
      id: "usuario-solo-b",
      tenantId: "tenant-b",
      name: "Usuario B",
      email: "b@example.com",
      emailVerified: null,
      image: null,
      role: "USER",
    }],
    cuentas: [{
      id: "cuenta-b",
      tenantId: "tenant-b",
      userId: "usuario-compartido",
      type: "oauth",
      provider: "google",
      providerAccountId: "google-123",
    }],
  };
  const clientes = new Map([
    ["tenant-a", crearClienteFalso("tenant-a", almacenA)],
    ["tenant-b", crearClienteFalso("tenant-b", almacenB)],
  ]);
  const tenantsConsultados: string[] = [];
  const adaptador = crearAdaptadorTenant({
    async obtenerTenantAutenticacion() {
      return TENANT_A;
    },
    async conPrismaTenant(tenantId, operacion) {
      tenantsConsultados.push(tenantId);
      const cliente = clientes.get(tenantId);
      if (!cliente) throw new Error("Tenant no registrado en el test");
      return operacion(cliente);
    },
  });

  const usuarioA = await adaptador.getUser?.("usuario-compartido");
  assert.equal(usuarioA?.id, "usuario-compartido");
  assert.equal(tenantIdUsuario(usuarioA), "tenant-a");

  const usuarioPorEmail = await adaptador.getUserByEmail?.(" ADMIN@EXAMPLE.COM ");
  assert.equal(usuarioPorEmail?.id, "usuario-compartido");

  const usuarioPorCuenta = await adaptador.getUserByAccount?.({
    provider: "google",
    providerAccountId: "google-123",
  });
  assert.equal(usuarioPorCuenta?.id, "usuario-compartido");
  assert.equal(tenantIdUsuario(usuarioPorCuenta), "tenant-a");

  const creado = await adaptador.createUser?.({
    id: "id-controlado-por-auth",
    name: "Nueva persona",
    email: " Nueva@Example.COM ",
    emailVerified: null,
    image: null,
  });
  assert.equal(creado?.id, "creado-2");
  assert.equal(tenantIdUsuario(creado), "tenant-a");
  assert.equal(creado?.email, "nueva@example.com");
  assert.equal(almacenA.usuarios[1]?.role, "USER");

  const cuentaAntes = almacenA.cuentas.length;
  const vincularCuenta = adaptador.linkAccount;
  assert.ok(vincularCuenta);
  await assert.rejects(
    async () => {
      await vincularCuenta({
        userId: "usuario-solo-b",
        type: "oauth",
        provider: "google",
        providerAccountId: "google-b-only",
      } as AdapterAccount);
    },
    /otra organización/,
  );
  assert.equal(almacenA.cuentas.length, cuentaAntes);
  assert.ok(tenantsConsultados.length >= 5);
  assert.ok(tenantsConsultados.every((tenantId) => tenantId === "tenant-a"));

  console.log("Adaptador Auth.js: lookup de usuario/cuenta, alta normalizada y bloqueo de pertenencia cruzada verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
