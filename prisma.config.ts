import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Solo el runner administrativo resuelve esta URL desde Logabyte Core.
// Sin un destino confirmado, los comandos de migración fallan cerrados.
const urlCli = process.env.LOGABYTE_CORE_SELECTED_DATABASE_URL ??
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
