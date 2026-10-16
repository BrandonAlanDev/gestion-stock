import type { CredencialesBaseTenant } from "../../src/lib/tenants/registry/types";

/** Construye una URL para la CLI de Prisma sin imprimir ni alterar las credenciales. */
export function construirUrlMysql(credenciales: CredencialesBaseTenant): string {
  const host = credenciales.host.includes(":")
    ? `[${credenciales.host}]`
    : credenciales.host;
  const url = new URL(`mysql://${host}:${credenciales.puerto}`);
  url.username = credenciales.usuario;
  url.password = credenciales.contrasena;
  url.pathname = `/${credenciales.base}`;
  if (credenciales.ssl) url.searchParams.set("sslaccept", "strict");
  return url.toString();
}
