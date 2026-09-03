import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

export function crearClienteBaseDatos(url: string): PrismaClient {
  const conexion = new URL(url);
  const esLocal = ["localhost", "127.0.0.1", "[::1]"].includes(conexion.hostname);
  const requiereTls = conexion.searchParams.get("sslaccept") === "strict" ||
    conexion.searchParams.get("ssl") === "true" || !esLocal;
  const limite = Number(conexion.searchParams.get("connection_limit") ?? "5");
  const puerto = Number(conexion.port || "3306");
  if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
    throw new Error("connection_limit debe ser un entero entre 1 y 100.");
  }
  const adaptador = new PrismaMariaDb({
    host: conexion.hostname,
    port: puerto,
    user: decodeURIComponent(conexion.username),
    password: decodeURIComponent(conexion.password),
    database: decodeURIComponent(conexion.pathname.slice(1)),
    ssl: requiereTls ? { rejectUnauthorized: true } : false,
    connectionLimit: limite,
    connectTimeout: 10_000,
  });
  return new PrismaClient({ adapter: adaptador });
}
