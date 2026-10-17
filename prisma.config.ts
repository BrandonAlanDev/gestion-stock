import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma necesita una URL para cargar la configuración incluso durante generate.
// Esta dirección inválida falla cerrada si se intenta migrar sin elegir una base.
const urlCli = process.env.DATABASE_URL ??
  'mysql://disabled:disabled@127.0.0.1:1/no_database_selected'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations-base-unica',
  },
  datasource: {
    url: urlCli,
  },
})
