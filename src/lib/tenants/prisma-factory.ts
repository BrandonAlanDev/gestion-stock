import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../../generated/prisma/client";

const globalPrisma = globalThis as typeof globalThis & {
  __clientePrisma?: PrismaClient;
};

function crearCliente(): PrismaClient {
  const valor = process.env.DATABASE_URL;
  if (!valor) throw new Error("Configurá DATABASE_URL para conectar la base de datos");
  const url = new URL(valor);
  if (url.protocol !== "mysql:") throw new Error("DATABASE_URL debe usar MySQL");
  const limite = Number(url.searchParams.get("connection_limit") ?? "10");
  const ssl = url.searchParams.get("sslaccept") === "strict" ||
    url.searchParams.get("sslmode") === "require";
  const adaptador = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    ssl: ssl ? { rejectUnauthorized: true } : false,
    connectionLimit: Number.isInteger(limite) && limite > 0 ? limite : 10,
    connectTimeout: 10_000,
  });
  return new PrismaClient({ adapter: adaptador });
}

export function obtenerPrisma(): PrismaClient {
  globalPrisma.__clientePrisma ??= crearCliente();
  return globalPrisma.__clientePrisma;
}

/** Compatibilidad temporal con los servicios que aún reciben un identificador legado. */
export async function conPrismaTenant<T>(
  _tenantId: string,
  operacion: (cliente: PrismaClient) => Promise<T>,
): Promise<T> {
  return operacion(obtenerPrisma());
}
