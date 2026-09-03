import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

// Verificamos si es entorno local usando DATABASE_HOST
const esLocal = (
  process.env.DATABASE_HOST === 'localhost' || 
  process.env.DATABASE_HOST === '127.0.0.1'
);

const adaptador = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: esLocal ? false : { rejectUnauthorized: true }, // Sin SSL en local
  connectionLimit: 5,
  connectTimeout: 10000
});

// Evita múltiples instancias de PrismaClient en desarrollo (hot reload)
const globalParaPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalParaPrisma.prisma || new PrismaClient({ adapter: adaptador });

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;

export default prisma;