import assert from "node:assert/strict";
import { resolverContextoSesionTenant } from "../src/lib/tenants/resolver-contexto-sesion";
import type { TenantPublico } from "../src/types/tenants";

const TENANT_A: TenantPublico = {
  id: "tenant-a",
  nombre: "Tienda A",
  slug: "tienda-a",
  dominio: "a.example.com",
  estado: "ACTIVO",
};

async function verificarSesionEnTenantResuelto(): Promise<void> {
  let tenantConsultado: string | null = null;
  const contexto = await resolverContextoSesionTenant(
    TENANT_A,
    { id: "usuario-compartido", tenantId: TENANT_A.id },
    async (tenantId, usuarioId) => {
      tenantConsultado = tenantId;
      return { id: usuarioId, tenantId, role: "ADMIN" };
    },
  );

  assert.equal(tenantConsultado, TENANT_A.id);
  assert.equal(contexto?.tenantId, TENANT_A.id);
  assert.equal(contexto?.usuarioId, "usuario-compartido");
  assert.equal(contexto?.rol, "ADMIN");
}

async function verificarSesionDeOtroTenant(): Promise<void> {
  let consultas = 0;
  const contexto = await resolverContextoSesionTenant(
    TENANT_A,
    { id: "usuario-compartido", tenantId: "tenant-b" },
    async () => {
      consultas += 1;
      return { id: "usuario-compartido", tenantId: "tenant-a", role: "ADMIN" };
    },
  );

  assert.equal(contexto, null);
  assert.equal(consultas, 0, "Una sesión de B no debe consultar el silo A aunque coincida el ID de usuario");
}

async function verificarUsuarioPersistidoEnTenantIncorrecto(): Promise<void> {
  const contexto = await resolverContextoSesionTenant(
    TENANT_A,
    { id: "usuario-compartido", tenantId: TENANT_A.id },
    async () => ({ id: "usuario-compartido", tenantId: "tenant-b", role: "ADMIN" }),
  );

  assert.equal(contexto, null, "La pertenencia se vuelve a comprobar en el resultado persistido");
}

async function verificarTenantNoActivo(): Promise<void> {
  let consultas = 0;
  const contexto = await resolverContextoSesionTenant(
    { ...TENANT_A, estado: "SUSPENDIDO" },
    { id: "usuario-compartido", tenantId: TENANT_A.id },
    async () => {
      consultas += 1;
      return { id: "usuario-compartido", tenantId: TENANT_A.id, role: "ADMIN" };
    },
  );

  assert.equal(contexto, null);
  assert.equal(consultas, 0, "Un tenant suspendido no debe consultar usuarios");
}

async function main(): Promise<void> {
  await verificarSesionEnTenantResuelto();
  await verificarSesionDeOtroTenant();
  await verificarUsuarioPersistidoEnTenantIncorrecto();
  await verificarTenantNoActivo();
  console.log("Sesión tenant: host, identidad, pertenencia y estado verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
