import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const esLocal =
  process.env.DATABASE_HOST === "localhost" ||
  process.env.DATABASE_HOST === "127.0.0.1";

const adaptador = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: esLocal ? false : { rejectUnauthorized: true },
  connectionLimit: 5,
  connectTimeout: 10000,
});

export const clientePrisma = new PrismaClient({ adapter: adaptador });
