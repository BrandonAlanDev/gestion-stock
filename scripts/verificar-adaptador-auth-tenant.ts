import assert from "node:assert/strict";
import type { AdapterUser } from "next-auth/adapters";
import type { PrismaClient } from "../generated/prisma/client";
import { crearAdaptadorTenant } from "../src/lib/autenticacion/crear-adaptador-tenant";
import type { TenantPublico } from "../src/types/tenants";

type Usuario = AdapterUser & { role: "ADMIN" | "USER" };
type Almacen = { usuarios: Usuario[]; cuentas: Array<{ provider: string; providerAccountId: string; userId: string }> };

function clienteFalso(almacen: Almacen): PrismaClient {
  return {
    user: {
      async findUnique({ where }: { where: { id?: string; email?: string } }) {
        return almacen.usuarios.find((usuario) =>
          where.id ? usuario.id === where.id : usuario.email === where.email,
        ) ?? null;
      },
      async create({ data }: { data: Omit<Usuario, "id" | "role"> }) {
        const usuario: Usuario = { ...data, id: `nuevo-${almacen.usuarios.length}`, role: "USER" };
        almacen.usuarios.push(usuario);
        return usuario;
      },
    },
    account: {
      async findUnique({ where }: { where: { provider_providerAccountId: { provider: string; providerAccountId: string } } }) {
        const cuenta = almacen.cuentas.find((fila) =>
          fila.provider === where.provider_providerAccountId.provider &&
          fila.providerAccountId === where.provider_providerAccountId.providerAccountId,
        );
        return cuenta ? { user: almacen.usuarios.find((usuario) => usuario.id === cuenta.userId) } : null;
      },
    },
  } as unknown as PrismaClient;
}

async function main(): Promise<void> {
  const usuario = (name: string): Usuario => ({
    id: "id-compartido", name, email: "compartido@example.com", emailVerified: null,
    image: null, role: "ADMIN",
  });
  const almacenes = new Map<string, Almacen>([
    ["cliente-a", { usuarios: [usuario("A")], cuentas: [{ provider: "google", providerAccountId: "cuenta", userId: "id-compartido" }] }],
    ["cliente-b", { usuarios: [usuario("B")], cuentas: [{ provider: "google", providerAccountId: "cuenta", userId: "id-compartido" }] }],
  ]);
  const clientes = new Map([...almacenes].map(([id, almacen]) => [id, clienteFalso(almacen)]));
  let seleccionado = "cliente-a";
  const usados: string[] = [];
  const adaptador = crearAdaptadorTenant({
    async obtenerTenantAutenticacion(): Promise<TenantPublico> {
      return { id: seleccionado, nombre: seleccionado, slug: seleccionado, dominio: `${seleccionado}.example.com`, estado: "ACTIVO" };
    },
    async conPrismaTenant(id, operacion) {
      usados.push(id);
      const cliente = clientes.get(id);
      if (!cliente) throw new Error("Cliente desconocido");
      return operacion(cliente);
    },
  });

  assert.equal((await adaptador.getUser?.("id-compartido"))?.name, "A");
  assert.equal((await adaptador.getUserByEmail?.("compartido@example.com"))?.name, "A");
  assert.equal((await adaptador.getUserByAccount?.({ provider: "google", providerAccountId: "cuenta" }))?.name, "A");
  seleccionado = "cliente-b";
  assert.equal((await adaptador.getUser?.("id-compartido"))?.name, "B");
  assert.equal((await adaptador.getUserByAccount?.({ provider: "google", providerAccountId: "cuenta" }))?.name, "B");
  const nuevo = await adaptador.createUser?.({ id: "id-sugerido", name: "Nuevo B", email: "nuevo@example.com", emailVerified: null, image: null });
  assert.equal(nuevo?.name, "Nuevo B");
  assert.equal(almacenes.get("cliente-a")?.usuarios.length, 1);
  assert.equal(almacenes.get("cliente-b")?.usuarios.length, 2);
  assert.deepEqual(usados, ["cliente-a", "cliente-a", "cliente-a", "cliente-b", "cliente-b", "cliente-b"]);
  console.log("Adaptador Auth.js: usuarios y cuentas aislados entre dos bases verificados.");
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
