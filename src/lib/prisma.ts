import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

const sslStatus = (process.env.HOST === 'localhost' || process.env.HOST === '127.0.0.1') ? false : true;

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: sslStatus, 
  },
  connectionLimit: 5,
  connectTimeout: 10000
});
const prisma = new PrismaClient({ adapter });

export { prisma }