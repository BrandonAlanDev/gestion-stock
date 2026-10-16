import type {} from "../src/types/next-auth";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import type { NextAuthConfig, User } from "next-auth";
import { decode, encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { crearCallbacksTenant } from "../src/lib/autenticacion/crear-callbacks-tenant";
import type { TenantPublico } from "../src/types/tenants";

type Callbacks = NonNullable<NextAuthConfig["callbacks"]>;
type ArgumentosJwt = Parameters<NonNullable<Callbacks["jwt"]>>[0];

const SALT_COOKIE = "authjs.session-token";
const SECRETO = randomBytes(32).toString("base64url");

const TENANTS: TenantPublico[] = [
  {
    id: "tenant-a",
    nombre: "Tienda A",
    slug: "tienda-a",
    dominio: "a.example.com",
    estado: "ACTIVO",
  },
  {
    id: "tenant-b",
    nombre: "Tienda B",
    slug: "tienda-b",
    dominio: "b.example.com",
    estado: "ACTIVO",
  },
];

function crearCallbacks(
  tenant: TenantPublico,
  buscarUsuario: (
    tenantId: string,
    usuarioId: string,
  ) => Promise<{
    id: string;
    tenantId: string;
    role: "ADMIN" | "USER";
    telefono: string | null;
    image: string | null;
  } | null>,
): Callbacks {
  return crearCallbacksTenant({
    async obtenerTenantAutenticacion() {
      return tenant;
    },
    async obtenerHostnameSolicitud() {
      return tenant.dominio;
    },
    buscarUsuario,
  });
}

async function aplicarCallbackJwt(
  callbacks: Callbacks,
  token: JWT,
  user?: User,
): Promise<JWT> {
  assert.ok(callbacks.jwt, "Auth.js debe configurar el callback JWT");
  const argumentos = {
    token,
    user,
    account: null,
    trigger: user ? "signIn" : undefined,
  } as ArgumentosJwt;
  const resultado = await callbacks.jwt(argumentos);
  assert.ok(resultado, "El callback debe devolver el token actualizado");
  return resultado;
}

async function crearCookieTenant(tenant: TenantPublico): Promise<string> {
  const callbacks = crearCallbacks(tenant, async (tenantId, usuarioId) => ({
    id: usuarioId,
    tenantId,
    role: "USER",
    telefono: null,
    image: null,
  }));
  const usuario = {
    id: "usuario-compartido",
    tenantId: tenant.id,
    role: "ADMIN",
    telefono: null,
    image: null,
  } as User;
  const token = await aplicarCallbackJwt(callbacks, { sub: usuario.id }, usuario);

  assert.equal(token.tenantId, tenant.id);
  assert.equal(token.tenantHost, tenant.dominio);
  assert.equal(token.role, "USER", "El rol persistido debe prevalecer sobre el claim de entrada");

  return encode({ token, secret: SECRETO, salt: SALT_COOKIE });
}

async function decodificarCookie(cookie: string): Promise<JWT> {
  const token = await decode({ token: cookie, secret: SECRETO, salt: SALT_COOKIE });
  assert.ok(token, "El token firmado y cifrado por Auth.js debe poder decodificarse");
  return token;
}

async function main(): Promise<void> {
  const tenantA = TENANTS[0];
  const tenantB = TENANTS[1];
  assert.ok(tenantA && tenantB);

  const cookieA = await crearCookieTenant(tenantA);
  const cookieB = await crearCookieTenant(tenantB);
  const tokenA = await decodificarCookie(cookieA);
  const tokenB = await decodificarCookie(cookieB);

  assert.equal(tokenA.id, "usuario-compartido");
  assert.equal(tokenB.id, "usuario-compartido");
  assert.equal(tokenA.tenantId, tenantA.id);
  assert.equal(tokenB.tenantId, tenantB.id);
  assert.notEqual(cookieA, cookieB, "IDs iguales deben producir sesiones aisladas por tenant");

  let busquedasEnB = 0;
  const callbacksB = crearCallbacks(tenantB, async () => {
    busquedasEnB += 1;
    return null;
  });
  const tokenTrasCruce = await aplicarCallbackJwt(callbacksB, tokenA);

  assert.equal(tokenTrasCruce.id, undefined);
  assert.equal(tokenTrasCruce.sub, undefined);
  assert.equal(tokenTrasCruce.tenantId, undefined);
  assert.equal(tokenTrasCruce.tenantHost, undefined);
  assert.equal(busquedasEnB, 0, "Una cookie de A debe invalidarse antes de consultar el silo B");

  console.log("JWT Auth.js: cookies cifradas con IDs iguales quedan vinculadas al tenant y se invalidan al cruzar de dominio.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
