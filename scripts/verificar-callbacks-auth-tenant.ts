import type {} from "../src/types/next-auth";
import assert from "node:assert/strict";
import type { NextAuthConfig, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { crearCallbacksTenant } from "../src/lib/autenticacion/crear-callbacks-tenant";
import type { TenantPublico } from "../src/types/tenants";

type Callbacks = NonNullable<NextAuthConfig["callbacks"]>;
type ArgumentosJwt = Parameters<NonNullable<Callbacks["jwt"]>>[0];
type ArgumentosSignIn = Parameters<NonNullable<Callbacks["signIn"]>>[0];
type ArgumentosSesion = Parameters<NonNullable<Callbacks["session"]>>[0];
type ResultadoSesion = Awaited<ReturnType<NonNullable<Callbacks["session"]>>>;

const TENANT_A: TenantPublico = {
  id: "tenant-a",
  nombre: "Tienda A",
  slug: "tienda-a",
  dominio: "a.example.com",
  estado: "ACTIVO",
};

function crearCallbacks(
  buscarUsuario: (
    tenantId: string,
    usuarioId: string,
  ) => Promise<{ id: string; tenantId: string; role: "ADMIN" | "USER"; telefono: string | null; image: string | null } | null>,
  obtenerTenant: () => Promise<TenantPublico> = async () => TENANT_A,
  obtenerHostname: () => Promise<string | null> = async () => "a.example.com",
) {
  const tenantsConsultados: string[] = [];
  const callbacks = crearCallbacksTenant({
    obtenerTenantAutenticacion: obtenerTenant,
    obtenerHostnameSolicitud: obtenerHostname,
    async buscarUsuario(tenantId, usuarioId) {
      tenantsConsultados.push(tenantId);
      return buscarUsuario(tenantId, usuarioId);
    },
  });

  return { callbacks, tenantsConsultados };
}

async function ejecutarSignIn(callbacks: Callbacks, user: User): Promise<string | boolean> {
  assert.ok(callbacks.signIn);
  const argumentos = {
    user,
    account: null,
    profile: undefined,
    email: undefined,
    credentials: undefined,
  } as ArgumentosSignIn;
  return callbacks.signIn(argumentos);
}

async function ejecutarJwt(
  callbacks: Callbacks,
  token: JWT,
  datos: { user?: User; trigger?: "signIn" | "signUp" | "update"; session?: unknown } = {},
): Promise<JWT> {
  assert.ok(callbacks.jwt);
  const argumentos = {
    token,
    user: datos.user,
    trigger: datos.trigger,
    session: datos.session,
    account: null,
  } as ArgumentosJwt;
  const resultado = await callbacks.jwt(argumentos);
  assert.ok(resultado);
  return resultado;
}

async function ejecutarCallbackSesion(
  callbacks: Callbacks,
  token: JWT,
): Promise<ResultadoSesion> {
  assert.ok(callbacks.session);
  const argumentos = {
    session: {
      expires: new Date(Date.now() + 60_000).toISOString(),
      user: {
        id: "",
        role: "USER",
        tenantId: "",
        tenantNombre: "",
        tenantSlug: "",
        name: null,
        email: "a@example.com",
        image: null,
        emailVerified: null,
      },
    },
    token,
    user: {
      id: "usuario-a",
      email: "a@example.com",
      emailVerified: null,
      name: "Usuario A",
      image: null,
    },
  } as ArgumentosSesion;
  return callbacks.session(argumentos);
}

async function verificarSignInAislado(): Promise<void> {
  const { callbacks } = crearCallbacks(async () => null);
  const usuarioA = { id: "usuario-a", tenantId: TENANT_A.id } as User;
  const usuarioB = { id: "usuario-b", tenantId: "tenant-b" } as User;
  const usuarioSinTenant = { id: "usuario-sin-tenant" } as User;

  assert.equal(await ejecutarSignIn(callbacks, usuarioA), true);
  assert.equal(await ejecutarSignIn(callbacks, usuarioB), false);
  assert.equal(await ejecutarSignIn(callbacks, usuarioSinTenant), false);

  const callbacksConRegistroCaido = crearCallbacks(
    async () => null,
    async () => { throw new Error("registro no disponible"); },
  ).callbacks;
  assert.equal(await ejecutarSignIn(callbacksConRegistroCaido, usuarioA), false);
}

async function verificarRevalidacionEnSilo(): Promise<void> {
  const { callbacks, tenantsConsultados } = crearCallbacks(async (tenantId, usuarioId) => ({
    id: usuarioId,
    tenantId,
    role: "USER",
    telefono: "111",
    image: null,
  }));
  const usuarioOAuth = {
    id: "usuario-compartido",
    role: "ADMIN",
    tenantId: TENANT_A.id,
    telefono: null,
    image: null,
  } as User;

  const token = await ejecutarJwt(callbacks, { sub: usuarioOAuth.id }, {
    user: usuarioOAuth,
    trigger: "signIn",
  });

  assert.equal(token.id, "usuario-compartido");
  assert.equal(token.tenantId, TENANT_A.id);
  assert.equal(token.tenantHost, "a.example.com");
  assert.equal(token.role, "USER", "El rol persistido debe prevalecer sobre el claim de entrada");
  assert.deepEqual(tenantsConsultados, [TENANT_A.id]);

  const sesion = await ejecutarCallbackSesion(callbacks, token);
  assert.ok(sesion.user);
  assert.equal(sesion.user.id, "usuario-compartido");
  assert.equal(sesion.user.tenantId, TENANT_A.id);
  assert.equal(sesion.user.tenantHost, "a.example.com");
}

async function verificarNuevoLoginVinculaHostActual(): Promise<void> {
  const { callbacks } = crearCallbacks(async (tenantId, usuarioId) => ({
    id: usuarioId,
    tenantId,
    role: "USER",
    telefono: null,
    image: null,
  }));
  const usuario = {
    id: "usuario-a",
    tenantId: TENANT_A.id,
    role: "USER",
  } as User;

  const token = await ejecutarJwt(callbacks, {
    sub: usuario.id,
    id: usuario.id,
    tenantId: TENANT_A.id,
    tenantHost: "dominio-anterior.example.com",
  }, { user: usuario, trigger: "signIn" });

  assert.equal(token.id, "usuario-a");
  assert.equal(token.tenantHost, "a.example.com");
}

async function verificarRechazoDeTenantAjeno(): Promise<void> {
  let busquedas = 0;
  const { callbacks, tenantsConsultados } = crearCallbacks(async () => {
    busquedas += 1;
    return null;
  });
  const token = await ejecutarJwt(callbacks, {
    sub: "usuario-compartido",
    id: "usuario-compartido",
    tenantId: "tenant-b",
    tenantHost: "b.example.com",
    role: "ADMIN",
    email: "privado@example.com",
  });

  assert.equal(token.id, undefined);
  assert.equal(token.sub, undefined);
  assert.equal(token.tenantId, undefined);
  assert.equal(token.email, undefined);
  assert.equal(busquedas, 0);
  assert.deepEqual(tenantsConsultados, []);
}

async function verificarRechazoDeHostAjeno(): Promise<void> {
  let busquedas = 0;
  const callbacks = crearCallbacks(
    async () => {
      busquedas += 1;
      return null;
    },
    async () => TENANT_A,
    async () => "b.example.com",
  ).callbacks;
  const token = await ejecutarJwt(callbacks, {
    sub: "usuario-a",
    id: "usuario-a",
    tenantId: TENANT_A.id,
    tenantHost: "a.example.com",
    role: "ADMIN",
    email: "a@example.com",
  });

  assert.equal(token.id, undefined);
  assert.equal(token.sub, undefined);
  assert.equal(token.tenantId, undefined);
  assert.equal(token.tenantHost, undefined);
  assert.equal(busquedas, 0, "Un JWT de otro hostname debe invalidarse antes de consultar el silo");
}

async function verificarTenantSuspendidoYUsuarioRevocado(): Promise<void> {
  const claims = {
    sub: "usuario-a",
    id: "usuario-a",
    tenantId: TENANT_A.id,
    tenantNombre: TENANT_A.nombre,
    role: "ADMIN" as const,
    email: "a@example.com",
  };
  let busquedas = 0;
  const callbacksSuspendidos = crearCallbacks(
    async () => {
      busquedas += 1;
      return null;
    },
    async () => { throw new Error("tenant suspendido o registro no disponible"); },
  ).callbacks;
  const tokenSuspendido = await ejecutarJwt(callbacksSuspendidos, { ...claims });
  assert.equal(tokenSuspendido.id, undefined);
  assert.equal(tokenSuspendido.tenantId, undefined);
  assert.equal(tokenSuspendido.email, undefined);
  assert.equal(busquedas, 0, "Un tenant no disponible no debe consultar su base comercial");

  const callbacksUsuarioRevocado = crearCallbacks(async () => null).callbacks;
  const tokenRevocado = await ejecutarJwt(callbacksUsuarioRevocado, { ...claims });
  assert.equal(tokenRevocado.id, undefined);
  assert.equal(tokenRevocado.sub, undefined);
  assert.equal(tokenRevocado.tenantId, undefined);
  assert.equal(tokenRevocado.email, undefined);
}

async function main(): Promise<void> {
  await verificarSignInAislado();
  await verificarRevalidacionEnSilo();
  await verificarNuevoLoginVinculaHostActual();
  await verificarRechazoDeTenantAjeno();
  await verificarRechazoDeHostAjeno();
  await verificarTenantSuspendidoYUsuarioRevocado();
  console.log("Callbacks Auth.js: tenant de login, revalidación, sesión, suspensión y revocación verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
